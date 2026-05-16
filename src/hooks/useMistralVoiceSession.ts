import { useCallback, useRef, useState } from 'react';

type MistralVoiceStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';

const SPEECH_VOLUME_THRESHOLD = 0.018;
const MIN_SPEECH_MS = 350;
const END_OF_TURN_SILENCE_MS = 1300;
const NO_SPEECH_TIMEOUT_MS = 12000;

interface MistralVoiceMessage {
  type?: string;
  role?: 'user' | 'agent';
  message?: string;
  content?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  audioData?: string;
  mimeType?: string;
  error?: string;
}

interface MistralVoiceStartOptions {
  transportUrl: string;
  token: string;
}

interface UseMistralVoiceSessionOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: MistralVoiceMessage) => void;
  onError?: (error: Error) => void;
}

const toWebSocketUrl = (url: string): string => {
  if (url.startsWith('https://')) return url.replace('https://', 'wss://');
  if (url.startsWith('http://')) return url.replace('http://', 'ws://');
  return url;
};

const parseMistralVoiceMessage = (event: MessageEvent): MistralVoiceMessage | null => {
  if (typeof event.data !== 'string') return null;

  try {
    return JSON.parse(event.data) as MistralVoiceMessage;
  } catch {
    return null;
  }
};

const getSupportedAudioMimeType = (): string => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

  return candidates.find(mimeType => MediaRecorder.isTypeSupported(mimeType)) || '';
};

const decodeBase64Audio = (audioData: string, mimeType: string): Blob => {
  const binary = window.atob(audioData);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
};

export const useMistralVoiceSession = ({
  onConnect,
  onDisconnect,
  onMessage,
  onError,
}: UseMistralVoiceSessionOptions) => {
  const [status, setStatus] = useState<MistralVoiceStatus>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const hasSpeechRef = useRef(false);
  const captureStartedAtRef = useRef(0);
  const speechStartedAtRef = useRef(0);
  const lastSpeechAtRef = useRef(0);

  const stopAnalyser = useCallback(() => {
    if (analyserFrameRef.current !== null) {
      window.cancelAnimationFrame(analyserFrameRef.current);
      analyserFrameRef.current = null;
    }
  }, []);

  const stopUserAudioCapture = useCallback(() => {
    stopAnalyser();
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.stop();
    } else {
      setIsListening(false);
    }
  }, [stopAnalyser]);

  const cleanup = useCallback(() => {
    stopUserAudioCapture();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
      audioElementRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsListening(false);
  }, [stopUserAudioCapture]);

  const startAudioAnalyser = useCallback(
    (stream: MediaStream) => {
      stopAnalyser();
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);

      const readVolume = () => {
        analyser.getByteTimeDomainData(samples);
        let sumSquares = 0;
        for (const sample of samples) {
          const centered = (sample - 128) / 128;
          sumSquares += centered * centered;
        }
        return Math.sqrt(sumSquares / samples.length);
      };

      const tick = () => {
        const now = Date.now();
        const volume = readVolume();
        if (volume >= SPEECH_VOLUME_THRESHOLD) {
          if (!hasSpeechRef.current) {
            speechStartedAtRef.current = now;
          }
          hasSpeechRef.current = true;
          lastSpeechAtRef.current = now;
        }

        const hasMinimumSpeech =
          hasSpeechRef.current && now - speechStartedAtRef.current >= MIN_SPEECH_MS;
        const hasTimedOutWaitingForSpeech =
          !hasSpeechRef.current && now - captureStartedAtRef.current >= NO_SPEECH_TIMEOUT_MS;

        if (
          hasTimedOutWaitingForSpeech ||
          (hasMinimumSpeech && now - lastSpeechAtRef.current >= END_OF_TURN_SILENCE_MS)
        ) {
          stopUserAudioCapture();
          return;
        }

        analyserFrameRef.current = window.requestAnimationFrame(tick);
      };

      analyserFrameRef.current = window.requestAnimationFrame(tick);
    },
    [stopAnalyser, stopUserAudioCapture]
  );

  const startUserAudioCapture = useCallback(() => {
    const socket = socketRef.current;
    const stream = streamRef.current;
    if (!stream || socket?.readyState !== WebSocket.OPEN) {
      return;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      return;
    }

    const mimeType = getSupportedAudioMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;
    hasSpeechRef.current = false;
    captureStartedAtRef.current = Date.now();
    speechStartedAtRef.current = 0;
    lastSpeechAtRef.current = captureStartedAtRef.current;

    socket.send(
      JSON.stringify({
        type: 'audio_start',
        mimeType: recorder.mimeType || mimeType || 'audio/webm',
      })
    );

    recorder.ondataavailable = event => {
      if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        void event.data.arrayBuffer().then(buffer => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(buffer);
          }
        });
      }
    };
    recorder.onstop = () => {
      stopAnalyser();
      setIsListening(false);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'audio_end' }));
      }
    };

    recorder.start(250);
    setIsListening(true);
    startAudioAnalyser(stream);
  }, [startAudioAnalyser, stopAnalyser]);

  const playAgentAudio = useCallback(
    async (audioData: string, mimeType: string) => {
      stopUserAudioCapture();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }

      const audioBlob = decodeBase64Audio(audioData, mimeType);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      setIsSpeaking(true);

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Failed to play Mistral TTS audio'));
        void audio.play().catch(reject);
      }).finally(() => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
      });

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        startUserAudioCapture();
      }
    },
    [startUserAudioCapture, stopUserAudioCapture]
  );

  const startSession = useCallback(
    async ({ transportUrl, token }: MistralVoiceStartOptions): Promise<void> => {
      setStatus('connecting');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const socket = new WebSocket(toWebSocketUrl(transportUrl));
        socketRef.current = socket;

        await new Promise<void>((resolve, reject) => {
          let settled = false;
          const settleConnected = () => {
            if (settled) return;
            settled = true;
            setStatus('connected');
            onConnect?.();
            resolve();
          };
          const settleRejected = (error: Error) => {
            if (settled) return;
            settled = true;
            reject(error);
          };

          socket.onmessage = event => {
            const message = parseMistralVoiceMessage(event);
            if (!message) return;

            if (typeof message.isSpeaking === 'boolean') {
              setIsSpeaking(message.isSpeaking);
            }
            if (typeof message.isListening === 'boolean') {
              setIsListening(message.isListening);
            }
            if (message.type === 'error') {
              settleRejected(new Error(message.error || 'Mistral voice runtime error'));
              onError?.(new Error(message.error || 'Mistral voice runtime error'));
              return;
            }
            if (message.type === 'session_started') {
              settleConnected();
            }
            if (message.type === 'agent_audio' && message.audioData) {
              void playAgentAudio(message.audioData, message.mimeType || 'audio/mpeg').catch(
                error => {
                  onError?.(error instanceof Error ? error : new Error('Failed to play audio'));
                }
              );
            }
            if (message.type === 'listening_ready') {
              startUserAudioCapture();
            }
            onMessage?.(message);
          };

          socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'auth', token }));
          };
          socket.onerror = () => settleRejected(new Error('Mistral voice connection failed'));
          socket.onclose = () => {
            cleanup();
            setStatus('disconnected');
            setIsSpeaking(false);
            setIsListening(false);
            onDisconnect?.();
            settleRejected(new Error('Mistral voice connection closed before session started'));
          };
        });

        socket.onclose = () => {
          cleanup();
          setStatus('disconnected');
          setIsSpeaking(false);
          setIsListening(false);
          onDisconnect?.();
        };
      } catch (error) {
        cleanup();
        setStatus('disconnected');
        onError?.(error instanceof Error ? error : new Error('Failed to start Mistral session'));
        throw error;
      }
    },
    [cleanup, onConnect, onDisconnect, onError, onMessage, playAgentAudio, startUserAudioCapture]
  );

  const endSession = useCallback(async (): Promise<void> => {
    setStatus('disconnecting');
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      stopUserAudioCapture();
      await new Promise<void>(resolve => {
        const timeout = window.setTimeout(resolve, 2000);
        socket.onclose = () => {
          window.clearTimeout(timeout);
          resolve();
        };
        socket.send(JSON.stringify({ type: 'end' }));
      });
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    }
    cleanup();
    setStatus('disconnected');
  }, [cleanup, stopUserAudioCapture]);

  return {
    status,
    isSpeaking,
    isListening,
    startSession,
    endSession,
  };
};
