import { useCallback, useEffect, useRef, useState } from 'react';

import { captureVoiceError, tagVoiceSession } from '@/lib/sentry';

import {
  PipecatEndControlType,
  PipecatVoiceMessage,
  PipecatVoiceStatus,
  SttProvider,
  isPipecatActiveMessage,
  isPipecatRuntimeReadyMessage,
} from '@/types/pipecat';

interface PipecatWebRTCStartOptions {
  webrtcUrl: string;
  token: string;
  iceServers?: string[];
  /** Capture from a specific microphone (MediaDeviceInfo.deviceId). */
  audioDeviceId?: string;
  sttProvider?: SttProvider;
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
   * Enables the HTTP WAV playback path for agent speech: runtime-rendered
   * utterances are fetched and played through an HTMLAudioElement. This is
   * the starting assumption for every session; when the runtime reports
   * ttsTransport="webrtc" in runtime_ready (the Kokoro production
   * configuration), the hook switches to the live WebRTC audio track and no
   * WAVs are fetched. WebRTC is always the mic/control lane either way.
   */
  playRuntimeTtsAudio?: boolean;
}

const ICE_GATHERING_TIMEOUT_MS = 750;
/** Capture settings every microphone this session opens is held to. */
const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};
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
  const endAckRef = useRef<{ id: string; resolve: () => void } | null>(null);
  const switchAckRef = useRef<{ id: string; resolve: (accepted: boolean) => void } | null>(null);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runtimePlaybackQueueRef = useRef<string[]>([]);
  const runtimePlaybackAudioRef = useRef<HTMLAudioElement | null>(null);
  const runtimePlaybackObjectUrlRef = useRef<string | null>(null);
  const runtimePlaybackResolveRef = useRef<(() => void) | null>(null);
  const runtimePlaybackActiveRef = useRef(false);
  // Set true when the runtime reports ttsTransport="webrtc": agent audio is the
  // live WebRTC track (streamed, in-sync with transcript), not HTTP WAVs.
  const webrtcAudioModeRef = useRef(false);

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
      // In WebRTC audio mode the agent speaks over the live track, so never
      // queue HTTP WAVs (the runtime doesn't send them, but guard regardless).
      if (webrtcAudioModeRef.current) return;
      if (!playRuntimeTtsAudio || message.type !== 'tts_utterance_ready') return;
      const name = message.sourceWavName || message.webrtcWavName;
      if (!name) return;
      runtimePlaybackQueueRef.current.push(name);
      void drainRuntimePlaybackQueue();
    },
    [drainRuntimePlaybackQueue, playRuntimeTtsAudio]
  );

  const cleanup = useCallback(() => {
    switchAckRef.current?.resolve(false);
    if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
    disconnectTimerRef.current = null;
    if (peerConnectionRef.current) peerConnectionRef.current.onconnectionstatechange = null;
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    stopRuntimeTtsPlayback();
    webrtcAudioModeRef.current = false;
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
    if (channel?.readyState !== DATA_CHANNEL_OPEN_STATE) return false;
    try {
      channel.send(JSON.stringify(message));
      return true;
    } catch {
      return false;
    }
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
    async ({
      webrtcUrl,
      token,
      iceServers,
      audioDeviceId,
      sttProvider,
    }: PipecatWebRTCStartOptions): Promise<void> => {
      setStatus('connecting');
      sessionWebrtcUrlRef.current = webrtcUrl;
      sessionTokenRef.current = token;
      sessionIdRef.current = webrtcUrl.match(/\/sessions\/([^/]+)\/webrtc/)?.[1] ?? null;
      tagVoiceSession(sessionIdRef.current);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            ...MIC_CONSTRAINTS,
            ...(audioDeviceId ? { deviceId: { exact: audioDeviceId } } : {}),
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
        dataChannel.onopen = () => {
          // Announce the channel is open so the runtime re-sends runtime_ready.
          // The copy the runtime sends at ICE-connect can be dropped inside
          // pipecat when the channel opens after the pipeline starts (always
          // the case on real-network RTT), leaving the remote track muted.
          sendControlMessage({ type: 'client_ready' });
        };

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
          const settleRuntimeReady = () => {
            if (settled) return;
            settled = true;
            setStatus('runtimeReady');
            startKeepAlive();
            onConnect?.();
            resolve();
          };
          const settleRejected = (error: Error) => {
            if (settled) return;
            settled = true;
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
            if (
              message.type === 'stt_switch_ack' &&
              message.requestId === switchAckRef.current?.id
            ) {
              switchAckRef.current?.resolve(message.accepted === true);
            }
            if (message.type === 'session_end_ack') {
              const ack = endAckRef.current;
              if (ack && ack.id === message.requestId) ack.resolve();
              return;
            }

            if (message.type === 'error') {
              const errorText = message.error ?? message.data?.error;
              const fatal = message.isFatal ?? message.fatal ?? message.data?.fatal ?? false;
              if (!fatal) {
                console.warn('Recoverable Pipecat WebRTC runtime error:', errorText);
                onMessage?.(message);
                return;
              }
              const err = new Error(errorText || 'Pipecat voice runtime error');
              captureVoiceError(err, { source: 'runtime_message' });
              settleRejected(err);
              onError?.(err);
              return;
            }
            if (message.type === 'runtime_ready' && message.ttsTransport === 'webrtc') {
              // Streaming mode: play the live WebRTC audio track instead of
              // fetching WAVs. Unmute the remote track (it starts muted so HTTP
              // playback is the default) and stop any queued WAV playback.
              webrtcAudioModeRef.current = true;
              if (remoteAudioRef.current) remoteAudioRef.current.muted = false;
              stopRuntimeTtsPlayback();
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
            if (peerConnection.connectionState === 'connected') {
              if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
              disconnectTimerRef.current = null;
              return;
            }
            const finishDisconnected = () => {
              const reason =
                peerConnection.connectionState === FAILED_CONNECTION_STATE
                  ? 'connection_failed'
                  : 'connection_disconnected';
              sendControlMessage({ type: 'client_exit', reason });
              const err = new Error('Voice connection lost. Please reconnect to continue.');
              const wasReady = settled;
              settleRejected(err);
              cleanup();
              setStatus('disconnected');
              if (wasReady) {
                captureVoiceError(err, { source: reason });
                onError?.(err);
              }
              onDisconnect?.();
            };
            if (
              peerConnection.connectionState === FAILED_CONNECTION_STATE ||
              peerConnection.connectionState === 'closed'
            ) {
              finishDisconnected();
            } else if (
              isDisconnectedPeerConnectionState(peerConnection.connectionState) &&
              !disconnectTimerRef.current
            ) {
              // A transient network change is not necessarily a failed call.
              disconnectTimerRef.current = setTimeout(finishDisconnected, 8000);
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
            ...(sttProvider ? { sttProvider } : {}),
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
        captureVoiceError(err, { source: 'start' });
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
      sendControlMessage,
      startKeepAlive,
      stopRuntimeTtsPlayback,
    ]
  );

  /**
   * Point the live session at a different microphone without reconnecting.
   *
   * The new track replaces the old one on the existing sender, so the
   * transceiver — and therefore the runtime's inbound track and its STT
   * socket — is untouched; the swap costs a brief gap in audio, not a
   * renegotiation. Called with no session open it is a no-op: the next
   * startSession picks the device up through audioDeviceId.
   */
  const switchAudioDevice = useCallback(async (audioDeviceId?: string): Promise<void> => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) return;
    const sender = peerConnection.getSenders().find(candidate => candidate.track?.kind === 'audio');
    if (!sender) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...MIC_CONSTRAINTS,
        ...(audioDeviceId ? { deviceId: { exact: audioDeviceId } } : {}),
      },
    });
    const track = stream.getAudioTracks()[0];
    if (!track) {
      stream.getTracks().forEach(candidate => candidate.stop());
      throw new Error('Selected microphone provided no audio track');
    }

    try {
      await sender.replaceTrack(track);
    } catch (error) {
      stream.getTracks().forEach(candidate => candidate.stop());
      throw error instanceof Error ? error : new Error('Failed to switch microphone');
    }

    // Only release the previous microphone once the new one is carrying audio.
    mediaStreamRef.current?.getTracks().forEach(candidate => candidate.stop());
    mediaStreamRef.current = stream;
  }, []);

  const endSession = useCallback(
    async (
      reason = 'client_ended',
      controlType: PipecatEndControlType = 'end'
    ): Promise<boolean> => {
      setStatus('disconnecting');
      const requestId = crypto.randomUUID();
      let acknowledged = false;
      await new Promise<void>(resolve => {
        const finish = () => {
          window.clearTimeout(timer);
          endAckRef.current = null;
          resolve();
        };
        const timer = window.setTimeout(finish, 1500);
        endAckRef.current = {
          id: requestId,
          resolve: () => {
            acknowledged = true;
            finish();
          },
        };
        if (!sendControlMessage({ type: controlType, reason, requestId })) finish();
      });
      cleanup();
      setStatus('disconnected');
      if (!acknowledged && controlType === 'end') {
        onMessage?.({ type: 'end_unconfirmed' });
      }
      return acknowledged;
    },
    [cleanup, sendControlMessage, onMessage]
  );

  const requestSttFallback = useCallback((): Promise<boolean> => {
    if (switchAckRef.current) return Promise.resolve(false);
    return new Promise(resolve => {
      const id = crypto.randomUUID();
      const finish = (accepted: boolean) => {
        window.clearTimeout(timer);
        switchAckRef.current = null;
        resolve(accepted);
      };
      const timer = window.setTimeout(() => finish(false), 8000);
      switchAckRef.current = { id, resolve: finish };
      if (!sendControlMessage({ type: 'stt_switch', requestId: id })) finish(false);
    });
  }, [sendControlMessage]);

  useEffect(() => cleanup, [cleanup]);

  useEffect(() => {
    // Best effort only: browsers cannot reliably distinguish refresh, close,
    // navigation, a crash, or a network loss. Do not claim a specific action.
    const onPageHide = () => {
      sendControlMessage({ type: 'client_exit', reason: 'page_hidden_exit' });
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [sendControlMessage]);

  return {
    status,
    isSpeaking,
    isListening,
    startSession,
    endSession,
    switchAudioDevice,
    requestSttFallback,
    sendControlMessage,
  };
};
