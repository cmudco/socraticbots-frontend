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
}

const ICE_GATHERING_TIMEOUT_MS = 3000;

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
}: UsePipecatWebRTCSessionOptions) => {
  const [status, setStatus] = useState<PipecatVoiceStatus>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
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
              if (message.isFatal === false) {
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
    [cleanup, onConnect, onDisconnect, onError, onMessage, startKeepAlive]
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
