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

interface WebRTCStatsSample {
  sampledAt: number;
  reports: Array<Record<string, unknown>>;
}

interface UsePipecatWebRTCSessionOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: PipecatVoiceMessage) => void;
  onError?: (error: Error) => void;
  /**
   * When true, captures the agent's incoming audio track to a local Blob
   * via MediaRecorder so it can be downloaded for offline comparison
   * against the raw Mistral MP3. Diagnostic-only; off by default.
   */
  recordAgentAudio?: boolean;
  /**
   * Diagnostic-only fallback: mute WebRTC agent playback and instead play
   * the runtime's captured source WAVs through normal HTTP + <audio>.
   */
  playDebugTtsAudio?: boolean;
}

const ICE_GATHERING_TIMEOUT_MS = 3000;

// Picks the first MediaRecorder mime type the browser actually supports.
// Chrome/Edge => audio/webm;codecs=opus, Safari => audio/mp4.
const pickRecorderMimeType = (): string | undefined => {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return candidates.find(type => MediaRecorder.isTypeSupported(type));
};

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
  recordAgentAudio = false,
  playDebugTtsAudio = false,
}: UsePipecatWebRTCSessionOptions) => {
  const [status, setStatus] = useState<PipecatVoiceStatus>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Diagnostic recorder — captures the agent's decoded audio so the user
  // can play it back and compare to the raw Mistral MP3.
  const agentRecorderRef = useRef<MediaRecorder | null>(null);
  const agentChunksRef = useRef<Blob[]>([]);
  const agentMimeTypeRef = useRef<string | undefined>(undefined);
  const agentRecordingStartedAtRef = useRef<number | null>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statsSamplesRef = useRef<WebRTCStatsSample[]>([]);
  const debugTtsPlaybackQueueRef = useRef<string[]>([]);
  const debugTtsPlaybackAudioRef = useRef<HTMLAudioElement | null>(null);
  const debugTtsPlaybackObjectUrlRef = useRef<string | null>(null);
  const debugTtsPlaybackResolveRef = useRef<(() => void) | null>(null);
  const debugTtsPlaybackActiveRef = useRef(false);

  // Diagnostic raw-audio fetch — connection info needed to pull the
  // per-utterance WAVs the runtime captured during this session.
  const sessionWebrtcUrlRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const buildDebugUtteranceUrl = useCallback((name: string): string | null => {
    const webrtcUrl = sessionWebrtcUrlRef.current;
    const token = sessionTokenRef.current;
    const sessionId = sessionIdRef.current;
    if (!webrtcUrl || !token || !sessionId) return null;
    const base = webrtcUrl.replace(/\/sessions\/[^/]+\/webrtc\/offer$/, '');
    return `${base}/sessions/${sessionId}/debug/utterances/${encodeURIComponent(name)}?token=${encodeURIComponent(token)}`;
  }, []);

  const stopDebugTtsPlayback = useCallback(() => {
    debugTtsPlaybackQueueRef.current = [];
    debugTtsPlaybackActiveRef.current = false;
    if (debugTtsPlaybackAudioRef.current) {
      debugTtsPlaybackAudioRef.current.pause();
      debugTtsPlaybackAudioRef.current.src = '';
      debugTtsPlaybackAudioRef.current = null;
    }
    debugTtsPlaybackResolveRef.current?.();
    debugTtsPlaybackResolveRef.current = null;
    if (debugTtsPlaybackObjectUrlRef.current) {
      URL.revokeObjectURL(debugTtsPlaybackObjectUrlRef.current);
      debugTtsPlaybackObjectUrlRef.current = null;
    }
  }, []);

  const drainDebugTtsPlaybackQueue = useCallback(async () => {
    if (debugTtsPlaybackActiveRef.current) return;
    debugTtsPlaybackActiveRef.current = true;
    try {
      while (debugTtsPlaybackQueueRef.current.length > 0) {
        const name = debugTtsPlaybackQueueRef.current.shift();
        if (!name) continue;
        const url = buildDebugUtteranceUrl(name);
        if (!url) continue;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`[debug-tts-playback] failed to fetch ${name} (${response.status})`);
            continue;
          }
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          debugTtsPlaybackObjectUrlRef.current = objectUrl;
          await new Promise<void>(resolve => {
            const audio = new Audio(objectUrl);
            debugTtsPlaybackAudioRef.current = audio;
            debugTtsPlaybackResolveRef.current = resolve;
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            void audio.play().catch(error => {
              console.warn('[debug-tts-playback] playback failed:', error);
              resolve();
            });
          });
          if (debugTtsPlaybackObjectUrlRef.current === objectUrl) {
            URL.revokeObjectURL(objectUrl);
            debugTtsPlaybackObjectUrlRef.current = null;
          }
        } catch (error) {
          console.warn(`[debug-tts-playback] failed to play ${name}:`, error);
        } finally {
          debugTtsPlaybackAudioRef.current = null;
          debugTtsPlaybackResolveRef.current = null;
        }
      }
    } finally {
      debugTtsPlaybackActiveRef.current = false;
    }
  }, [buildDebugUtteranceUrl]);

  const enqueueDebugTtsPlayback = useCallback(
    (message: PipecatVoiceMessage) => {
      if (!playDebugTtsAudio || message.type !== 'debug_tts_utterance') return;
      const name = message.sourceWavName || message.webrtcWavName;
      if (!name) return;
      debugTtsPlaybackQueueRef.current.push(name);
      void drainDebugTtsPlaybackQueue();
    },
    [drainDebugTtsPlaybackQueue, playDebugTtsAudio]
  );

  const stopStatsSampler = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  const startStatsSampler = useCallback(() => {
    if (!recordAgentAudio || statsIntervalRef.current) return;
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) return;

    const sample = async () => {
      try {
        const stats = await peerConnection.getStats();
        const reports: Array<Record<string, unknown>> = [];
        stats.forEach(report => {
          const raw = report as RTCStats & Record<string, unknown>;
          const type = String(raw.type ?? '');
          const isAudioInbound =
            type === 'inbound-rtp' && (raw.kind === 'audio' || raw.mediaType === 'audio');
          const isAudioPlayout = type === 'media-playout' || type === 'track';
          if (!isAudioInbound && !isAudioPlayout) return;

          reports.push({
            id: raw.id,
            type: raw.type,
            timestamp: raw.timestamp,
            kind: raw.kind,
            mediaType: raw.mediaType,
            packetsReceived: raw.packetsReceived,
            packetsLost: raw.packetsLost,
            packetsDiscarded: raw.packetsDiscarded,
            jitter: raw.jitter,
            jitterBufferDelay: raw.jitterBufferDelay,
            jitterBufferTargetDelay: raw.jitterBufferTargetDelay,
            jitterBufferEmittedCount: raw.jitterBufferEmittedCount,
            jitterBufferMinimumDelay: raw.jitterBufferMinimumDelay,
            totalSamplesReceived: raw.totalSamplesReceived,
            concealedSamples: raw.concealedSamples,
            silentConcealedSamples: raw.silentConcealedSamples,
            concealmentEvents: raw.concealmentEvents,
            insertedSamplesForDeceleration: raw.insertedSamplesForDeceleration,
            removedSamplesForAcceleration: raw.removedSamplesForAcceleration,
            audioLevel: raw.audioLevel,
            totalAudioEnergy: raw.totalAudioEnergy,
            totalSamplesDuration: raw.totalSamplesDuration,
            synthesizedSamplesDuration: raw.synthesizedSamplesDuration,
            totalPlayoutDelay: raw.totalPlayoutDelay,
          });
        });
        if (reports.length > 0) {
          statsSamplesRef.current.push({ sampledAt: Date.now(), reports });
        }
      } catch (error) {
        console.warn('[debug-recorder] WebRTC stats sampling failed:', error);
      }
    };

    void sample();
    statsIntervalRef.current = setInterval(() => void sample(), 250);
  }, [recordAgentAudio]);

  const stopAgentRecorder = useCallback(async (): Promise<void> => {
    const recorder = agentRecorderRef.current;
    agentRecorderRef.current = null;
    if (!recorder || recorder.state === 'inactive') return;
    // Wait for the final 'dataavailable' + 'stop' so the last chunk
    // is appended before callers attempt to build the download Blob.
    await new Promise<void>(resolve => {
      const finish = () => {
        recorder.removeEventListener('stop', finish);
        resolve();
      };
      recorder.addEventListener('stop', finish);
      try {
        recorder.stop();
      } catch {
        recorder.removeEventListener('stop', finish);
        resolve();
      }
    });
  }, []);

  const startAgentRecorder = useCallback(
    (stream: MediaStream) => {
      if (!recordAgentAudio) return;
      if (typeof MediaRecorder === 'undefined') {
        console.warn('MediaRecorder unsupported; cannot capture agent audio.');
        return;
      }
      if (agentRecorderRef.current) return;
      const mimeType = pickRecorderMimeType();
      agentMimeTypeRef.current = mimeType;
      agentChunksRef.current = [];
      try {
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorder.ondataavailable = event => {
          if (event.data && event.data.size > 0) {
            agentChunksRef.current.push(event.data);
          }
        };
        // Request periodic chunks so a mid-session crash still leaves data.
        recorder.start(1000);
        agentRecorderRef.current = recorder;
        agentRecordingStartedAtRef.current = Date.now();
        console.info(
          `[debug-recorder] capturing agent audio (mime=${mimeType ?? 'browser-default'})`
        );
      } catch (error) {
        console.warn('Failed to start agent audio recorder:', error);
      }
    },
    [recordAgentAudio]
  );

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    // Fire-and-forget; cleanup is sync. endSession awaits the recorder
    // explicitly before calling cleanup so chunks are already flushed.
    void stopAgentRecorder();
    stopStatsSampler();
    stopDebugTtsPlayback();
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
  }, [stopAgentRecorder, stopStatsSampler, stopDebugTtsPlayback]);

  /**
   * Returns a fresh Blob URL of the WebRTC-recorded agent audio (what the
   * browser actually decoded). Caller is responsible for revoking the URL
   * via URL.revokeObjectURL when done. Returns null if nothing captured.
   */
  const getRecordedAudioBlobUrl = useCallback((): { url: string; mime: string } | null => {
    if (agentChunksRef.current.length === 0) return null;
    const mime = agentMimeTypeRef.current || 'audio/webm';
    const blob = new Blob(agentChunksRef.current, { type: mime });
    return { url: URL.createObjectURL(blob), mime };
  }, []);

  /**
   * Fetches the raw Mistral utterance WAVs that the runtime captured for
   * the current session and returns them as in-browser Blob URLs ready to
   * drop into an <audio src=…> element. This is the "control" path — the
   * audio bytes the runtime received from Mistral, *without* going
   * through Pipecat transport / Opus / WebRTC.
   */
  const fetchRawUtterances = useCallback(async (): Promise<
    Array<{ name: string; url: string }>
  > => {
    const webrtcUrl = sessionWebrtcUrlRef.current;
    const token = sessionTokenRef.current;
    const sessionId = sessionIdRef.current;
    if (!webrtcUrl || !token || !sessionId) {
      console.warn('[debug-recorder] cannot fetch raw utterances — session info missing.');
      return [];
    }
    // Strip ".../sessions/<id>/webrtc/offer" → base origin/path.
    const base = webrtcUrl.replace(/\/sessions\/[^/]+\/webrtc\/offer$/, '');
    const qs = `?token=${encodeURIComponent(token)}`;
    try {
      const listResp = await fetch(`${base}/sessions/${sessionId}/debug/utterances${qs}`);
      if (!listResp.ok) {
        console.warn(`[debug-recorder] list failed (${listResp.status})`);
        return [];
      }
      const data = (await listResp.json()) as { utterances: string[] };
      const out: Array<{ name: string; url: string }> = [];
      for (const name of data.utterances ?? []) {
        const wavResp = await fetch(
          `${base}/sessions/${sessionId}/debug/utterances/${encodeURIComponent(name)}${qs}`
        );
        if (!wavResp.ok) continue;
        const blob = await wavResp.blob();
        out.push({ name, url: URL.createObjectURL(blob) });
      }
      console.info(`[debug-recorder] fetched ${out.length} raw utterance(s) for ${sessionId}`);
      return out;
    } catch (error) {
      console.warn('[debug-recorder] fetchRawUtterances failed:', error);
      return [];
    }
  }, []);

  const downloadAgentRecording = useCallback((filename?: string): boolean => {
    if (agentChunksRef.current.length === 0) {
      console.warn(
        '[debug-recorder] no agent audio captured — enable recordAgentAudio and run a session first.'
      );
      return false;
    }
    const mime = agentMimeTypeRef.current || 'audio/webm';
    const blob = new Blob(agentChunksRef.current, { type: mime });
    const extension = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm';
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = filename ?? `agent-audio-${stamp}.${extension}`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    const durationMs = agentRecordingStartedAtRef.current
      ? Date.now() - agentRecordingStartedAtRef.current
      : 0;
    console.info(
      `[debug-recorder] downloaded ${name} (${blob.size} bytes, ~${(durationMs / 1000).toFixed(1)}s)`
    );
    return true;
  }, []);

  const downloadWebRTCStats = useCallback((filename?: string): boolean => {
    if (statsSamplesRef.current.length === 0) {
      console.warn('[debug-recorder] no WebRTC stats captured.');
      return false;
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = filename ?? `webrtc-audio-stats-${stamp}.json`;
    const blob = new Blob([JSON.stringify(statsSamplesRef.current, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    console.info(`[debug-recorder] downloaded ${name} (${blob.size} bytes)`);
    return true;
  }, []);

  const uploadWebRTCStats = useCallback(async (): Promise<void> => {
    if (statsSamplesRef.current.length === 0) return;
    const webrtcUrl = sessionWebrtcUrlRef.current;
    const token = sessionTokenRef.current;
    const sessionId = sessionIdRef.current;
    if (!webrtcUrl || !token || !sessionId) return;
    const base = webrtcUrl.replace(/\/sessions\/[^/]+\/webrtc\/offer$/, '');
    try {
      const response = await fetch(
        `${base}/sessions/${sessionId}/debug/webrtc-stats?token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statsSamplesRef.current),
        }
      );
      if (!response.ok) {
        console.warn(`[debug-recorder] WebRTC stats upload failed (${response.status})`);
      }
    } catch (error) {
      console.warn('[debug-recorder] failed to upload WebRTC stats:', error);
    }
  }, []);

  const sendControlMessage = useCallback((message: PipecatVoiceMessage) => {
    const channel = dataChannelRef.current;
    if (channel?.readyState !== 'open') return;
    channel.send(JSON.stringify(message));
  }, []);

  const startKeepAlive = useCallback(() => {
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    pingIntervalRef.current = setInterval(() => {
      const channel = dataChannelRef.current;
      if (channel?.readyState === 'open') {
        channel.send(`ping:${Date.now()}`);
      }
    }, 1000);
  }, []);

  const startSession = useCallback(
    async ({ webrtcUrl, token, iceServers }: PipecatWebRTCStartOptions): Promise<void> => {
      setStatus('connecting');
      // Reset diagnostic recorder state for a fresh session.
      agentChunksRef.current = [];
      statsSamplesRef.current = [];
      agentRecordingStartedAtRef.current = null;
      sessionWebrtcUrlRef.current = webrtcUrl;
      sessionTokenRef.current = token;
      // webrtcUrl looks like ".../sessions/<id>/webrtc/offer".
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
        remoteAudio.muted = playDebugTtsAudio;
        remoteAudio.srcObject = remoteStream;
        remoteAudioRef.current = remoteAudio;

        peerConnection.ontrack = event => {
          event.streams[0]?.getAudioTracks().forEach(track => remoteStream.addTrack(track));
          if (!event.streams[0]) {
            remoteStream.addTrack(event.track);
          }
          void remoteAudio.play().catch(() => {
            // Browser autoplay can briefly reject; the next user gesture/session event retries.
          });
          // Kick off the diagnostic recorder once we have at least one
          // agent audio track in the remote stream.
          if (remoteStream.getAudioTracks().length > 0) {
            startAgentRecorder(remoteStream);
            startStatsSampler();
          }
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
            if (isPipecatRuntimeReadyMessage(message)) {
              settleRuntimeReady();
            }
            if (isPipecatActiveMessage(message)) {
              setStatus('active');
            }
            if (typeof message.isSpeaking === 'boolean') {
              setIsSpeaking(message.isSpeaking);
            }
            if (typeof message.isListening === 'boolean') {
              setIsListening(message.isListening);
            }
            enqueueDebugTtsPlayback(message);
            onMessage?.(message);
          };

          peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState === 'failed') {
              settleRejected(new Error('Pipecat WebRTC connection failed'));
            }
            if (
              peerConnection.connectionState === 'closed' ||
              peerConnection.connectionState === 'disconnected'
            ) {
              cleanup();
              setStatus('disconnected');
              onDisconnect?.();
            }
          };
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await waitForIceGatheringComplete(peerConnection);

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
      onConnect,
      onDisconnect,
      onError,
      onMessage,
      enqueueDebugTtsPlayback,
      playDebugTtsAudio,
      startAgentRecorder,
      startKeepAlive,
      startStatsSampler,
    ]
  );

  const endSession = useCallback(
    async (reason = 'client_ended', controlType: PipecatEndControlType = 'end'): Promise<void> => {
      setStatus('disconnecting');
      sendControlMessage({ type: controlType, reason });
      await new Promise(resolve => window.setTimeout(resolve, 500));
      // Await the recorder so the last chunk is in the buffer before
      // cleanup tears down the MediaStream tracks. Callers that fire
      // downloadAgentRecording() after endSession() will see complete data.
      await stopAgentRecorder();
      await uploadWebRTCStats();
      cleanup();
      setStatus('disconnected');
    },
    [cleanup, sendControlMessage, stopAgentRecorder, uploadWebRTCStats]
  );

  useEffect(() => cleanup, [cleanup]);

  return {
    status,
    isSpeaking,
    isListening,
    startSession,
    endSession,
    downloadAgentRecording,
    downloadWebRTCStats,
    getRecordedAudioBlobUrl,
    fetchRawUtterances,
  };
};
