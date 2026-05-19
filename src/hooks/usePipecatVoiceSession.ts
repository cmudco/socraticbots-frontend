import { useCallback, useEffect, useRef, useState } from 'react';

import {
  PipecatEndControlType,
  PipecatVoiceMessage,
  PipecatVoiceStatus,
  isPipecatActiveMessage,
  isPipecatRuntimeReadyMessage,
} from '@/types/pipecat';

/**
 * Full-duplex voice session for the Mistral voice agent
 * (provider `mistral_pipecat`, served by the Pipecat runtime).
 *
 * Streams microphone PCM continuously and plays agent audio through an
 * interruptible Web Audio queue. That continuous mic + flushable playback
 * is what makes barge-in possible: the server does VAD/turn-taking and,
 * when the student talks over the agent, sends an `interrupt` message
 * that flushes whatever agent audio is still queued.
 *
 * Wire protocol (matches runtime/pipecat_serializer.py):
 *   browser -> server: binary = raw PCM s16le mono 16 kHz (continuous)
 *   server -> browser: binary = raw PCM s16le mono 24 kHz agent audio
 *                       text   = JSON control/transcript events
 */

const CAPTURE_SAMPLE_RATE = 16000;
const PLAYBACK_SAMPLE_RATE = 24000;
const CAPTURE_BUFFER_SIZE = 4096;
// Jitter buffer: agent audio arrives as many small chunks. Wait until this
// much is queued before starting playback so startup network/TTS jitter
// can't cause underruns (the "glitchy first second"). Re-cushioned on a
// mid-stream stall so playback never schedules into the past.
const INITIAL_PREROLL_SECONDS = 0.45;
const MIN_PREROLL_SECONDS = 0.25;
const MAX_PREROLL_SECONDS = 0.9;
const PREROLL_STEP_SECONDS = 0.05;
const RECOVER_CUSHION_SECONDS = 0.18;

interface PipecatVoiceStartOptions {
  transportUrl: string;
  token: string;
}

interface UsePipecatVoiceSessionOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: PipecatVoiceMessage) => void;
  onError?: (error: Error) => void;
}

const toWebSocketUrl = (url: string): string => {
  if (url.startsWith('https://')) return url.replace('https://', 'wss://');
  if (url.startsWith('http://')) return url.replace('http://', 'ws://');
  return url;
};

const floatToPCM16 = (input: Float32Array): ArrayBuffer => {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  return output.buffer;
};

const resampleFloat32 = (
  input: Float32Array,
  fromSampleRate: number,
  toSampleRate: number
): Float32Array => {
  if (fromSampleRate === toSampleRate) return input;

  const ratio = fromSampleRate / toSampleRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i += 1) {
    const sourceIndex = i * ratio;
    const leftIndex = Math.floor(sourceIndex);
    const rightIndex = Math.min(leftIndex + 1, input.length - 1);
    const weight = sourceIndex - leftIndex;
    output[i] = input[leftIndex] * (1 - weight) + input[rightIndex] * weight;
  }

  return output;
};

const pcm16ToFloat = (buffer: ArrayBuffer): Float32Array => {
  const view = new DataView(buffer);
  const samples = buffer.byteLength / 2;
  const output = new Float32Array(samples);
  for (let i = 0; i < samples; i += 1) {
    output[i] = view.getInt16(i * 2, true) / 0x8000;
  }
  return output;
};

export const usePipecatVoiceSession = ({
  onConnect,
  onDisconnect,
  onMessage,
  onError,
}: UsePipecatVoiceSessionOptions) => {
  const [status, setStatus] = useState<PipecatVoiceStatus>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const playheadRef = useRef(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const pendingBuffersRef = useRef<AudioBuffer[]>([]);
  const bufferedSecondsRef = useRef(0);
  const primedRef = useRef(false);
  const targetPrerollSecondsRef = useRef(INITIAL_PREROLL_SECONDS);
  const playbackUnderrunInTurnRef = useRef(false);
  // "Agent speaking" is driven by the playback queue (what the user
  // actually hears), not by server TTS-segment events which flicker
  // off between sentences while audio is still playing.
  const speakingOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetPlaybackQueue = useCallback(() => {
    scheduledSourcesRef.current.forEach(source => {
      try {
        source.onended = null;
        source.stop();
      } catch {
        /* already stopped */
      }
    });
    scheduledSourcesRef.current = [];
    pendingBuffersRef.current = [];
    bufferedSecondsRef.current = 0;
    primedRef.current = false;
    if (speakingOffTimerRef.current) {
      clearTimeout(speakingOffTimerRef.current);
      speakingOffTimerRef.current = null;
    }
    if (playbackCtxRef.current) {
      playheadRef.current = playbackCtxRef.current.currentTime;
    }
  }, []);

  const prepareNextAgentTurn = useCallback(() => {
    if (!playbackUnderrunInTurnRef.current) {
      targetPrerollSecondsRef.current = Math.max(
        MIN_PREROLL_SECONDS,
        targetPrerollSecondsRef.current - PREROLL_STEP_SECONDS
      );
    }
    playbackUnderrunInTurnRef.current = false;
    pendingBuffersRef.current = [];
    bufferedSecondsRef.current = 0;
    primedRef.current = false;
    if (playbackCtxRef.current) {
      playheadRef.current = playbackCtxRef.current.currentTime;
    }
  }, []);

  const flushPlayback = useCallback(() => {
    // Barge-in: drop everything queued so the next agent turn re-cushions.
    resetPlaybackQueue();
    setIsSpeaking(false);
  }, [resetPlaybackQueue]);

  // Schedule one buffer strictly after the playhead. If we've fallen behind
  // real time (mid-stream stall), re-insert a small cushion instead of
  // scheduling in the past, which would click/overlap.
  const scheduleBuffer = useCallback(
    (audioBuffer: AudioBuffer) => {
      const ctx = playbackCtxRef.current;
      if (!ctx) return;

      let startAt = playheadRef.current;
      if (startAt < ctx.currentTime) {
        startAt = ctx.currentTime + RECOVER_CUSHION_SECONDS;
        targetPrerollSecondsRef.current = Math.min(
          MAX_PREROLL_SECONDS,
          targetPrerollSecondsRef.current + PREROLL_STEP_SECONDS
        );
        playbackUnderrunInTurnRef.current = true;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(startAt);
      playheadRef.current = startAt + audioBuffer.duration;

      // Agent is audibly speaking as soon as audio is queued.
      if (speakingOffTimerRef.current) {
        clearTimeout(speakingOffTimerRef.current);
        speakingOffTimerRef.current = null;
      }
      setIsSpeaking(true);

      scheduledSourcesRef.current.push(source);
      source.onended = () => {
        scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== source);
        // Only flip "speaking" off once the queue has truly drained, with a
        // short grace so it doesn't flicker between consecutive TTS chunks.
        if (
          scheduledSourcesRef.current.length === 0 &&
          pendingBuffersRef.current.length === 0 &&
          !speakingOffTimerRef.current
        ) {
          speakingOffTimerRef.current = setTimeout(() => {
            speakingOffTimerRef.current = null;
            if (
              scheduledSourcesRef.current.length === 0 &&
              pendingBuffersRef.current.length === 0
            ) {
              prepareNextAgentTurn();
              setIsSpeaking(false);
            }
          }, 450);
        }
      };
    },
    [prepareNextAgentTurn]
  );

  const enqueueAgentAudio = useCallback(
    (buffer: ArrayBuffer) => {
      const ctx = playbackCtxRef.current;
      if (!ctx || buffer.byteLength === 0) return;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const floats = pcm16ToFloat(buffer);
      const audioBuffer = ctx.createBuffer(1, floats.length, PLAYBACK_SAMPLE_RATE);
      // .set() avoids the Float32Array<ArrayBuffer> vs <ArrayBufferLike>
      // generic mismatch that copyToChannel's typings trip on.
      audioBuffer.getChannelData(0).set(floats);

      if (!primedRef.current) {
        // Build the pre-roll cushion before the first sound plays.
        pendingBuffersRef.current.push(audioBuffer);
        bufferedSecondsRef.current += audioBuffer.duration;
        if (bufferedSecondsRef.current < targetPrerollSecondsRef.current) return;

        primedRef.current = true;
        playheadRef.current = ctx.currentTime + RECOVER_CUSHION_SECONDS;
        const queued = pendingBuffersRef.current;
        pendingBuffersRef.current = [];
        bufferedSecondsRef.current = 0;
        queued.forEach(scheduleBuffer);
        return;
      }

      scheduleBuffer(audioBuffer);
    },
    [scheduleBuffer]
  );

  const cleanup = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    if (captureCtxRef.current) {
      void captureCtxRef.current.close();
      captureCtxRef.current = null;
    }
    if (playbackCtxRef.current) {
      void playbackCtxRef.current.close();
      playbackCtxRef.current = null;
    }
    scheduledSourcesRef.current = [];
    pendingBuffersRef.current = [];
    bufferedSecondsRef.current = 0;
    primedRef.current = false;
    targetPrerollSecondsRef.current = INITIAL_PREROLL_SECONDS;
    playbackUnderrunInTurnRef.current = false;
    if (speakingOffTimerRef.current) {
      clearTimeout(speakingOffTimerRef.current);
      speakingOffTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  const startCapture = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;

    const captureCtx = new AudioContext({ sampleRate: CAPTURE_SAMPLE_RATE });
    captureCtxRef.current = captureCtx;
    const source = captureCtx.createMediaStreamSource(stream);
    const processor = captureCtx.createScriptProcessor(CAPTURE_BUFFER_SIZE, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = event => {
      const socket = socketRef.current;
      if (socket?.readyState !== WebSocket.OPEN) return;
      const channelData = event.inputBuffer.getChannelData(0);
      const resampled = resampleFloat32(channelData, captureCtx.sampleRate, CAPTURE_SAMPLE_RATE);
      socket.send(floatToPCM16(resampled));
    };

    // ScriptProcessor only runs while connected to the graph; route it
    // through a silent gain so it never echoes the mic to the speakers.
    const muted = captureCtx.createGain();
    muted.gain.value = 0;
    source.connect(processor);
    processor.connect(muted);
    muted.connect(captureCtx.destination);
  }, []);

  const startSession = useCallback(
    async ({ transportUrl, token }: PipecatVoiceStartOptions): Promise<void> => {
      setStatus('connecting');
      try {
        playbackCtxRef.current = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
        await playbackCtxRef.current.resume();
        playheadRef.current = 0;
        pendingBuffersRef.current = [];
        bufferedSecondsRef.current = 0;
        primedRef.current = false;
        targetPrerollSecondsRef.current = INITIAL_PREROLL_SECONDS;
        playbackUnderrunInTurnRef.current = false;
        await startCapture();

        const url = `${toWebSocketUrl(transportUrl)}?token=${encodeURIComponent(token)}`;
        const socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';
        socketRef.current = socket;

        await new Promise<void>((resolve, reject) => {
          let settled = false;
          const settleRuntimeReady = () => {
            if (settled) return;
            settled = true;
            setStatus('runtimeReady');
            onConnect?.();
            resolve();
          };
          const settleRejected = (error: Error) => {
            if (settled) return;
            settled = true;
            reject(error);
          };

          socket.onmessage = event => {
            if (event.data instanceof ArrayBuffer) {
              settleRuntimeReady();
              setStatus('active');
              enqueueAgentAudio(event.data);
              return;
            }
            let message: PipecatVoiceMessage | null = null;
            try {
              message = JSON.parse(event.data as string) as PipecatVoiceMessage;
            } catch {
              return;
            }
            if (!message) return;

            if (message.type === 'interrupt') {
              flushPlayback();
            }
            if (isPipecatRuntimeReadyMessage(message)) {
              settleRuntimeReady();
            }
            if (isPipecatActiveMessage(message)) {
              setStatus('active');
            }
            if (message.type === 'error') {
              if (message.isFatal === false) {
                console.warn('Recoverable Pipecat runtime error:', message.error);
                onMessage?.(message);
                return;
              }
              const err = new Error(message.error || 'Pipecat voice runtime error');
              settleRejected(err);
              onError?.(err);
              return;
            }
            // `isSpeaking` is intentionally NOT bound to server messages -
            // it's driven by the actual playback queue (see scheduleBuffer)
            // so it reflects what the student hears, not TTS-segment events.
            if (typeof message.isListening === 'boolean') {
              setIsListening(message.isListening);
            }
            onMessage?.(message);
          };

          socket.onerror = () => settleRejected(new Error('Pipecat voice connection failed'));
          socket.onclose = () => {
            cleanup();
            setStatus('disconnected');
            onDisconnect?.();
            settleRejected(new Error('Pipecat connection closed before session started'));
          };
        });

        socket.onclose = () => {
          cleanup();
          setStatus('disconnected');
          onDisconnect?.();
        };
      } catch (error) {
        cleanup();
        setStatus('disconnected');
        const err = error instanceof Error ? error : new Error('Failed to start session');
        onError?.(err);
        throw err;
      }
    },
    [
      cleanup,
      enqueueAgentAudio,
      flushPlayback,
      onConnect,
      onDisconnect,
      onError,
      onMessage,
      startCapture,
    ]
  );

  const endSession = useCallback(
    async (reason = 'client_ended', controlType: PipecatEndControlType = 'end'): Promise<void> => {
      setStatus('disconnecting');
      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify({ type: controlType, reason }));
        } catch {
          /* socket already closing */
        }
        await new Promise<void>(resolve => {
          const timeout = window.setTimeout(resolve, 1500);
          socket.onclose = () => {
            window.clearTimeout(timeout);
            resolve();
          };
        });
        if (socket.readyState === WebSocket.OPEN) socket.close();
      }
      cleanup();
      setStatus('disconnected');
    },
    [cleanup]
  );

  useEffect(() => {
    return () => {
      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
        try {
          socket.close();
        } catch {
          /* socket already closed */
        }
      }
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    isSpeaking,
    isListening,
    startSession,
    endSession,
  };
};
