import { useCallback, useEffect, useRef, useState } from 'react';

import {
  PipecatEndControlType,
  PipecatVoiceMessage,
  PipecatVoiceStatus,
  isPipecatActiveMessage,
  isPipecatRuntimeReadyMessage,
} from '@/types/pipecat';

interface PipecatWebRTCStartOptions {
  webrtcUrl: string;
  token: string;
  iceServers?: string[];
}

interface WebRTCAnswerResponse {
  sdp: string;
  type: RTCSdpType;
  pcId: string;
}

interface UsePipecatWebRTCSessionOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: PipecatVoiceMessage) => void;
  onError?: (error: Error) => void;
  /**
   * Plays runtime-generated TTS WAV artifacts over HTTP instead of using
   * WebRTC as the audible output path. WebRTC remains the mic/control lane.
   */
  playRuntimeTtsAudio?: boolean;
}

const ICE_GATHERING_TIMEOUT_MS = 3000;
const DATA_CHANNEL_OPEN_STATE: RTCDataChannelState = 'open';
const FAILED_CONNECTION_STATE: RTCPeerConnectionState = 'failed';
const DISCONNECT_CONNECTION_STATES = new Set<RTCPeerConnectionState>(['closed', 'disconnected']);

const isDisconnectedPeerConnectionState = (state: RTCPeerConnectionState) =>
  DISCONNECT_CONNECTION_STATES.has(state);

const waitForIceGatheringComplete = (
  peerConnection: RTCPeerConnection,
  timeoutMs = ICE_GATHERING_TIMEOUT_MS
): Promise<void> => {
  if (peerConnection.iceGatheringState === 'complete') return Promise.resolve();

  return new Promise(resolve => {
    const timer = window.setTimeout(() => {
      peerConnection.removeEventListener('icegatheringstatechange', handleStateChange);
      resolve();
    }, timeoutMs);

    const handleStateChange = () => {
      if (peerConnection.iceGatheringState === 'complete') {
        window.clearTimeout(timer);
        peerConnection.removeEventListener('icegatheringstatechange', handleStateChange);
        resolve();
      }
    };
    peerConnection.addEventListener('icegatheringstatechange', handleStateChange);
  });
};

export const usePipecatWebRTCSession = ({
  onConnect,
  onDisconnect,
  onMessage,
  onError,
  playRuntimeTtsAudio = true,
}: UsePipecatWebRTCSessionOptions) => {
  const [status, setStatus] = useState<PipecatVoiceStatus>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runtimePlaybackQueueRef = useRef<string[]>([]);
  const runtimePlaybackAudioRef = useRef<HTMLAudioElement | null>(null);
  const runtimePlaybackObjectUrlRef = useRef<string | null>(null);
  const runtimePlaybackResolveRef = useRef<(() => void) | null>(null);
  const runtimePlaybackActiveRef = useRef(false);

  const sessionWebrtcUrlRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const buildRuntimeUtteranceUrl = useCallback((name: string): string | null => {
    const webrtcUrl = sessionWebrtcUrlRef.current;
    const token = sessionTokenRef.current;
    const sessionId = sessionIdRef.current;
    if (!webrtcUrl || !token || !sessionId) return null;
    const base = webrtcUrl.replace(/\/sessions\/[^/]+\/webrtc\/offer$/, '');
    return `${base}/sessions/${sessionId}/utterances/${encodeURIComponent(name)}?token=${encodeURIComponent(token)}`;
  }, []);

  const stopRuntimeTtsPlayback = useCallback(() => {
    runtimePlaybackQueueRef.current = [];
    runtimePlaybackActiveRef.current = false;
    if (runtimePlaybackAudioRef.current) {
      runtimePlaybackAudioRef.current.pause();
      runtimePlaybackAudioRef.current.src = '';
      runtimePlaybackAudioRef.current = null;
    }
    runtimePlaybackResolveRef.current?.();
    runtimePlaybackResolveRef.current = null;
    if (runtimePlaybackObjectUrlRef.current) {
      URL.revokeObjectURL(runtimePlaybackObjectUrlRef.current);
      runtimePlaybackObjectUrlRef.current = null;
    }
  }, []);

  const drainRuntimePlaybackQueue = useCallback(async () => {
    if (runtimePlaybackActiveRef.current) return;
    runtimePlaybackActiveRef.current = true;
    try {
      while (runtimePlaybackQueueRef.current.length > 0) {
        const name = runtimePlaybackQueueRef.current.shift();
        if (!name) continue;
        const url = buildRuntimeUtteranceUrl(name);
        if (!url) continue;
        try {
          // Runtime utterance URLs are absolute, signed FastAPI URLs, not
          // Django API routes. Use fetch directly so playback does not pick up
          // the app-wide base URL or bearer-token behavior from baseRequest.
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`[runtime-tts] failed to fetch ${name} (${response.status})`);
            continue;
          }
          const objectUrl = URL.createObjectURL(await response.blob());
          runtimePlaybackObjectUrlRef.current = objectUrl;
          await new Promise<void>(resolve => {
            const audio = new Audio(objectUrl);
            runtimePlaybackAudioRef.current = audio;
            runtimePlaybackResolveRef.current = resolve;
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            void audio.play().catch(error => {
              console.warn('[runtime-tts] playback failed:', error);
              resolve();
            });
          });
          if (runtimePlaybackObjectUrlRef.current === objectUrl) {
            URL.revokeObjectURL(objectUrl);
            runtimePlaybackObjectUrlRef.current = null;
          }
        } catch (error) {
          console.warn(`[runtime-tts] failed to play ${name}:`, error);
        } finally {
          runtimePlaybackAudioRef.current = null;
          runtimePlaybackResolveRef.current = null;
        }
      }
    } finally {
      runtimePlaybackActiveRef.current = false;
    }
  }, [buildRuntimeUtteranceUrl]);

  const enqueueRuntimeTtsPlayback = useCallback(
    (message: PipecatVoiceMessage) => {
      if (!playRuntimeTtsAudio || message.type !== 'tts_utterance_ready') return;
      const name = message.sourceWavName || message.webrtcWavName;
      if (!name) return;
      runtimePlaybackQueueRef.current.push(name);
      void drainRuntimePlaybackQueue();
    },
    [drainRuntimePlaybackQueue, playRuntimeTtsAudio]
  );

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    stopRuntimeTtsPlayback();
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }
    setIsSpeaking(false);
    setIsListening(false);
  }, [stopRuntimeTtsPlayback]);

  const sendControlMessage = useCallback((message: PipecatVoiceMessage) => {
    const channel = dataChannelRef.current;
    if (channel?.readyState !== DATA_CHANNEL_OPEN_STATE) return;
    channel.send(JSON.stringify(message));
  }, []);

  const startKeepAlive = useCallback(() => {
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    pingIntervalRef.current = setInterval(() => {
      const channel = dataChannelRef.current;
      if (channel?.readyState === DATA_CHANNEL_OPEN_STATE) {
        channel.send(`ping:${Date.now()}`);
      }
    }, 1000);
  }, []);

  const startSession = useCallback(
    async ({ webrtcUrl, token, iceServers }: PipecatWebRTCStartOptions): Promise<void> => {
      setStatus('connecting');
      sessionWebrtcUrlRef.current = webrtcUrl;
      sessionTokenRef.current = token;
      sessionIdRef.current = webrtcUrl.match(/\/sessions\/([^/]+)\/webrtc/)?.[1] ?? null;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;

        const peerConnection = new RTCPeerConnection({
          iceServers: (iceServers?.length ? iceServers : ['stun:stun.l.google.com:19302']).map(
            server => ({ urls: server })
          ),
        });
        peerConnectionRef.current = peerConnection;

        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack) throw new Error('No microphone audio track available');
        peerConnection.addTransceiver(audioTrack, {
          direction: 'sendrecv',
          streams: [stream],
        });

        const dataChannel = peerConnection.createDataChannel('app');
        dataChannelRef.current = dataChannel;

        const remoteStream = new MediaStream();
        const remoteAudio = new Audio();
        remoteAudio.autoplay = true;
        remoteAudio.muted = playRuntimeTtsAudio;
        remoteAudio.srcObject = remoteStream;
        remoteAudioRef.current = remoteAudio;

        peerConnection.ontrack = event => {
          event.streams[0]?.getAudioTracks().forEach(track => remoteStream.addTrack(track));
          if (!event.streams[0]) remoteStream.addTrack(event.track);
          void remoteAudio.play().catch(() => {
            // Browser autoplay can briefly reject; later user gestures retry playback.
          });
        };

        const connectedPromise = new Promise<void>((resolve, reject) => {
          let settled = false;
          const connectionTimer = window.setTimeout(() => {
            settleRejected(new Error('Pipecat WebRTC connection timed out'));
          }, 15000);
          const settleRuntimeReady = () => {
            if (settled) return;
            settled = true;
            window.clearTimeout(connectionTimer);
            setStatus('runtimeReady');
            startKeepAlive();
            onConnect?.();
            resolve();
          };
          const settleRejected = (error: Error) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(connectionTimer);
            reject(error);
          };

          dataChannel.onmessage = event => {
            if (typeof event.data !== 'string') return;
            let message: PipecatVoiceMessage | null = null;
            try {
              message = JSON.parse(event.data) as PipecatVoiceMessage;
            } catch {
              return;
            }
            if (!message) return;

            if (message.type === 'error') {
              if (message.isFatal === false || message.fatal === false) {
                console.warn('Recoverable Pipecat WebRTC runtime error:', message.error);
                onMessage?.(message);
                return;
              }
              const err = new Error(message.error || 'Pipecat voice runtime error');
              settleRejected(err);
              onError?.(err);
              return;
            }
            if (isPipecatRuntimeReadyMessage(message)) settleRuntimeReady();
            if (isPipecatActiveMessage(message)) setStatus('active');
            if (typeof message.isSpeaking === 'boolean') setIsSpeaking(message.isSpeaking);
            if (typeof message.isListening === 'boolean') setIsListening(message.isListening);
            if (message.type === 'interrupt') stopRuntimeTtsPlayback();
            enqueueRuntimeTtsPlayback(message);
            onMessage?.(message);
          };

          peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState === FAILED_CONNECTION_STATE) {
              settleRejected(new Error('Pipecat WebRTC connection failed'));
            }
            if (isDisconnectedPeerConnectionState(peerConnection.connectionState)) {
              cleanup();
              setStatus('disconnected');
              onDisconnect?.();
            }
          };
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await waitForIceGatheringComplete(peerConnection);

        // The WebRTC offer goes to the standalone FastAPI runtime, not the
        // Django REST API. Keep fetch here so this handshake remains isolated
        // from baseRequest auth/header/base-url behavior.
        const response = await fetch(`${webrtcUrl}?token=${encodeURIComponent(token)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sdp: peerConnection.localDescription?.sdp,
            type: peerConnection.localDescription?.type,
          }),
        });
        if (!response.ok) {
          throw new Error(`Pipecat WebRTC offer failed (${response.status})`);
        }
        const answer = (await response.json()) as WebRTCAnswerResponse;
        await peerConnection.setRemoteDescription(answer);

        await connectedPromise;
      } catch (error) {
        cleanup();
        setStatus('disconnected');
        const err = error instanceof Error ? error : new Error('Failed to start WebRTC session');
        onError?.(err);
        throw err;
      }
    },
    [
      cleanup,
      enqueueRuntimeTtsPlayback,
      onConnect,
      onDisconnect,
      onError,
      onMessage,
      playRuntimeTtsAudio,
      startKeepAlive,
      stopRuntimeTtsPlayback,
    ]
  );

  const endSession = useCallback(
    async (reason = 'client_ended', controlType: PipecatEndControlType = 'end'): Promise<void> => {
      setStatus('disconnecting');
      sendControlMessage({ type: controlType, reason });
      await new Promise(resolve => window.setTimeout(resolve, 500));
      cleanup();
      setStatus('disconnected');
    },
    [cleanup, sendControlMessage]
  );

  useEffect(() => cleanup, [cleanup]);

  return {
    status,
    isSpeaking,
    isListening,
    startSession,
    endSession,
  };
};
