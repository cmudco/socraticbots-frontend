import { useCallback, useEffect, useRef, useState } from 'react';

import { captureVoiceError, recordVoiceEvent, tagVoiceSession } from '@/lib/sentry';
import {
  ConnectionQuality,
  VoiceConnectionMonitor,
  isExpectedVoiceError,
  normalizeVoiceError,
} from '@/lib/voiceLifecycle';

import {
  PipecatEndControlType,
  PipecatVoiceMessage,
  PipecatVoiceStatus,
  SttProvider,
  isPipecatActiveMessage,
  isPipecatRuntimeReadyMessage,
} from '@/types/pipecat';
import { type VoiceBrowserSignal, VoiceDiagnosticKind } from '@/types/voiceDiagnostics';

interface PipecatWebRTCStartOptions {
  webrtcUrl: string;
  token: string;
  iceServers?: string[];
  /** Capture from a specific microphone (MediaDeviceInfo.deviceId). */
  audioDeviceId?: string;
  sttProvider?: SttProvider;
  /** Already acquired by the exam's permission preflight; ownership transfers to this hook. */
  mediaStream?: MediaStream;
  onDiagnostic?: (signal: VoiceBrowserSignal) => void;
  onMicrophone?: (stream: MediaStream) => void;
}

interface WebRTCAnswerResponse {
  sdp: string;
  type: RTCSdpType;
  pcId: string;
}

interface UsePipecatWebRTCSessionOptions {
  /** Let the owner send and acknowledge its exit before disposing the transport. */
  onUnmount?: () => Promise<void>;
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
  onUnmount,
  onConnect,
  onDisconnect,
  onMessage,
  onError,
  playRuntimeTtsAudio = true,
}: UsePipecatWebRTCSessionOptions) => {
  const [status, setStatus] = useState<PipecatVoiceStatus>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('checking');
  const attemptRef = useRef<AbortController | null>(null);
  const onUnmountRef = useRef(onUnmount);
  useEffect(() => {
    onUnmountRef.current = onUnmount;
  }, [onUnmount]);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const microphoneObserverRef = useRef<PipecatWebRTCStartOptions['onMicrophone']>(undefined);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endAckRef = useRef<{ id: string; resolve: (acknowledged: boolean) => void } | null>(null);
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
    const attempt = attemptRef.current;
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
          if (attempt !== attemptRef.current || attempt?.signal.aborted) return;
          if (!response.ok) {
            throw new Error(`Runtime audio fetch failed (${response.status})`);
          }
          const blob = await response.blob();
          if (attempt !== attemptRef.current || attempt?.signal.aborted) return;
          const objectUrl = URL.createObjectURL(blob);
          runtimePlaybackObjectUrlRef.current = objectUrl;
          await new Promise<void>(resolve => {
            const audio = new Audio(objectUrl);
            runtimePlaybackAudioRef.current = audio;
            runtimePlaybackResolveRef.current = resolve;
            audio.onended = () => resolve();
            audio.onerror = () => {
              captureVoiceError(new Error('Runtime audio playback failed'), {
                source: 'tts_playback',
              });
              resolve();
            };
            void audio.play().catch(error => {
              captureVoiceError(error, { source: 'tts_playback' });
              resolve();
            });
          });
          if (runtimePlaybackObjectUrlRef.current === objectUrl) {
            URL.revokeObjectURL(objectUrl);
            runtimePlaybackObjectUrlRef.current = null;
          }
        } catch (error) {
          captureVoiceError(error instanceof Error ? error : new Error('Runtime audio failed'), {
            source: 'tts_playback',
          });
        } finally {
          if (attempt === attemptRef.current) {
            runtimePlaybackAudioRef.current = null;
            runtimePlaybackResolveRef.current = null;
          }
        }
      }
    } finally {
      if (attempt === attemptRef.current) runtimePlaybackActiveRef.current = false;
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
    endAckRef.current?.resolve(false);
    attemptRef.current?.abort();
    attemptRef.current = null;
    microphoneObserverRef.current = undefined;
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    statsIntervalRef.current = null;
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
    if (dataChannelRef.current) {
      dataChannelRef.current.onmessage = null;
      dataChannelRef.current.onopen = null;
      dataChannelRef.current.close();
    }
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
        try {
          channel.send(`ping:${Date.now()}`);
        } catch (error) {
          captureVoiceError(error instanceof Error ? error : new Error('Voice keepalive failed'), {
            source: 'keepalive',
          });
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        }
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
      mediaStream,
      onDiagnostic,
      onMicrophone,
    }: PipecatWebRTCStartOptions): Promise<void> => {
      cleanup();
      microphoneObserverRef.current = onMicrophone;
      const attempt = new AbortController();
      attemptRef.current = attempt;
      const isCurrent = () => attemptRef.current === attempt && !attempt.signal.aborted;
      const assertCurrent = () => {
        if (!isCurrent()) throw new DOMException('Voice startup cancelled', 'AbortError');
      };
      // Covers permission, offer, ICE and runtime-ready waits, including a silent server.
      const aborted = new Promise<never>((_, reject) => {
        attempt.signal.addEventListener('abort', () => reject(attempt.signal.reason), {
          once: true,
        });
      });
      void aborted.catch(() => {});
      const deadline = window.setTimeout(
        () => attempt.abort(new Error('Voice connection timed out. Please retry.')),
        30000
      );
      const wait = <T>(operation: Promise<T>) => Promise.race([operation, aborted]);
      setStatus('connecting');
      setConnectionQuality('checking');
      sessionWebrtcUrlRef.current = webrtcUrl;
      sessionTokenRef.current = token;
      sessionIdRef.current = webrtcUrl.match(/\/sessions\/([^/]+)\/webrtc/)?.[1] ?? null;
      tagVoiceSession(sessionIdRef.current);
      recordVoiceEvent('startup_started', { sessionId: sessionIdRef.current });

      try {
        const microphone = mediaStream
          ? Promise.resolve(mediaStream)
          : navigator.mediaDevices.getUserMedia({
              audio: {
                ...MIC_CONSTRAINTS,
                ...(audioDeviceId ? { deviceId: { exact: audioDeviceId } } : {}),
              },
            });
        // getUserMedia cannot be aborted: release a track granted after abandonment.
        void microphone.then(
          stream => {
            if (!isCurrent()) stream.getTracks().forEach(track => track.stop());
          },
          () => {}
        );
        const stream = await wait(microphone);
        assertCurrent();
        mediaStreamRef.current = stream;
        onMicrophone?.(stream);
        recordVoiceEvent('microphone_ready');

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
          if (!isCurrent()) return;
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
          if (!isCurrent()) return;
          event.streams[0]?.getAudioTracks().forEach(track => remoteStream.addTrack(track));
          if (!event.streams[0]) remoteStream.addTrack(event.track);
          void remoteAudio.play().catch(error => {
            if (isCurrent()) {
              captureVoiceError(error, { source: 'remote_audio_playback' });
              onError?.(
                new Error(
                  'Audio playback was blocked. Check browser audio permissions, then retry.'
                )
              );
            }
          });
        };

        const connectedPromise = new Promise<void>((resolve, reject) => {
          let settled = false;
          const settleRuntimeReady = () => {
            if (settled || !isCurrent()) return;
            settled = true;
            setStatus('runtimeReady');
            startKeepAlive();
            recordVoiceEvent('runtime_ready');
            const monitor = new VoiceConnectionMonitor();
            let polling = false;
            if (typeof peerConnection.getStats === 'function') {
              statsIntervalRef.current = setInterval(async () => {
                if (polling || !isCurrent() || peerConnection.connectionState !== 'connected')
                  return;
                polling = true;
                try {
                  const report = await peerConnection.getStats();
                  if (isCurrent()) setConnectionQuality(monitor.sample(report));
                } catch (error) {
                  if (isCurrent()) {
                    captureVoiceError(
                      error instanceof Error ? error : new Error('Connection statistics failed'),
                      { source: 'connection_stats' }
                    );
                    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
                  }
                } finally {
                  polling = false;
                }
              }, 2000);
            }
            onConnect?.();
            resolve();
          };
          const settleRejected = (error: Error) => {
            if (settled) return;
            settled = true;
            reject(error);
          };

          dataChannel.onmessage = event => {
            if (!isCurrent()) return;
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
              if (ack && ack.id === message.requestId) ack.resolve(true);
              return;
            }

            if (message.type === 'error') {
              const errorText = message.error ?? message.data?.error;
              const fatal = message.isFatal ?? message.fatal ?? message.data?.fatal ?? false;
              if (!fatal) {
                // The runtime owns exception reporting; do not duplicate recovered errors.
                recordVoiceEvent('runtime_recoverable_error');
                onMessage?.(message);
                return;
              }
              const err = new Error(errorText || 'Pipecat voice runtime error');
              captureVoiceError(err, { source: 'runtime_message' });
              const wasReady = settled;
              settleRejected(err);
              if (wasReady) {
                cleanup();
                setStatus('disconnected');
                onDisconnect?.();
              }
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
            if (!isCurrent()) return;
            recordVoiceEvent('connection_state', { state: peerConnection.connectionState });
            onDiagnostic?.({
              kind: VoiceDiagnosticKind.PeerState,
              peerState: peerConnection.connectionState,
            });
            if (peerConnection.connectionState === 'connected') {
              setConnectionQuality('checking');
              if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
              disconnectTimerRef.current = null;
              return;
            }
            const finishDisconnected = () => {
              if (!isCurrent()) return;
              const reason =
                peerConnection.connectionState === FAILED_CONNECTION_STATE
                  ? 'connection_failed'
                  : 'connection_disconnected';
              sendControlMessage({ type: 'client_exit', reason });
              const err = new Error('Voice connection lost. Please reconnect to continue.');
              const wasReady = settled;
              settleRejected(err);
              if (!wasReady) return; // The startup catch owns cleanup/reporting.
              cleanup();
              setConnectionQuality('lost');
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
              setConnectionQuality('lost');
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
        // A transport rejection can precede completion of the HTTP offer.
        void connectedPromise.catch(() => {});

        const offer = await wait(peerConnection.createOffer());
        assertCurrent();
        await wait(peerConnection.setLocalDescription(offer));
        await wait(waitForIceGatheringComplete(peerConnection));
        assertCurrent();

        // The WebRTC offer goes to the standalone FastAPI runtime, not the
        // Django REST API. Keep fetch here so this handshake remains isolated
        // from baseRequest auth/header/base-url behavior.
        const response = await wait(
          fetch(`${webrtcUrl}?token=${encodeURIComponent(token)}`, {
            signal: attempt.signal,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sdp: peerConnection.localDescription?.sdp,
              type: peerConnection.localDescription?.type,
              ...(sttProvider ? { sttProvider } : {}),
            }),
          })
        );
        assertCurrent();
        if (!response.ok) {
          throw new Error(`Pipecat WebRTC offer failed (${response.status})`);
        }
        const answer = (await wait(response.json())) as WebRTCAnswerResponse;
        assertCurrent();
        await wait(peerConnection.setRemoteDescription(answer));

        await wait(connectedPromise);
        assertCurrent();
      } catch (error) {
        if (attemptRef.current !== attempt)
          throw new DOMException('Voice startup cancelled', 'AbortError');
        const failure = attempt.signal.aborted ? attempt.signal.reason : error;
        cleanup();
        setStatus('disconnected');
        const err = normalizeVoiceError(failure);
        if (!isExpectedVoiceError(err)) captureVoiceError(err, { source: 'start' });
        recordVoiceEvent('startup_failed', { category: err.name });
        onError?.(err);
        throw err;
      } finally {
        window.clearTimeout(deadline);
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
    if (peerConnectionRef.current !== peerConnection) {
      stream.getTracks().forEach(candidate => candidate.stop());
      return;
    }
    const track = stream.getAudioTracks()[0];
    if (!track) {
      stream.getTracks().forEach(candidate => candidate.stop());
      throw new Error('Selected microphone provided no audio track');
    }

    try {
      await sender.replaceTrack(track);
      if (peerConnectionRef.current !== peerConnection) {
        stream.getTracks().forEach(candidate => candidate.stop());
        return;
      }
    } catch (error) {
      stream.getTracks().forEach(candidate => candidate.stop());
      throw error instanceof Error ? error : new Error('Failed to switch microphone');
    }

    // Only release the previous microphone once the new one is carrying audio.
    mediaStreamRef.current?.getTracks().forEach(candidate => candidate.stop());
    mediaStreamRef.current = stream;
    microphoneObserverRef.current?.(stream);
  }, []);

  const endSession = useCallback(
    async (
      reason = 'client_ended',
      controlType: PipecatEndControlType = 'end'
    ): Promise<boolean> => {
      const endingAttempt = attemptRef.current;
      setStatus('disconnecting');
      const requestId = crypto.randomUUID();
      let acknowledged = false;
      await new Promise<void>(resolve => {
        const finish = () => {
          window.clearTimeout(timer);
          if (endAckRef.current?.id === requestId) endAckRef.current = null;
          resolve();
        };
        const timer = window.setTimeout(finish, 1500);
        endAckRef.current = {
          id: requestId,
          resolve: received => {
            acknowledged = received;
            finish();
          },
        };
        if (!sendControlMessage({ type: controlType, reason, requestId })) finish();
      });
      if (endingAttempt !== attemptRef.current) return false;
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

  useEffect(
    () => () => {
      const abandonedAttempt = attemptRef.current;
      const shutdown = onUnmountRef.current;
      if (!abandonedAttempt || !shutdown) {
        cleanup();
        return;
      }
      // React does not await effect cleanup. The owner uses the bounded end ACK
      // before closing, rather than racing it with a second immediate cleanup.
      void Promise.resolve()
        .then(() => {
          if (attemptRef.current === abandonedAttempt) return shutdown();
        })
        .catch(error => {
          captureVoiceError(normalizeVoiceError(error), { source: 'navigation_cleanup' });
        })
        .finally(() => {
          if (attemptRef.current === abandonedAttempt) cleanup();
        });
    },
    [cleanup]
  );

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
    connectionQuality,
    isSpeaking,
    isListening,
    startSession,
    endSession,
    switchAudioDevice,
    requestSttFallback,
    sendControlMessage,
  };
};
