/**
 * VoiceInterface component for conducting voice exams.
 * Uses the configured provider runtime for real-time voice conversations.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConversation } from '@elevenlabs/react';

import {
  useCancelConversation,
  useEndConversation,
  useGetSignedUrl,
  useStartConversation,
} from '@/hooks/queries/useVoiceAgents';
import { usePipecatVoiceSession } from '@/hooks/usePipecatVoiceSession';
import { usePipecatWebRTCSession } from '@/hooks/usePipecatWebRTCSession';

import { formatTimeInCall } from '@/utils/formatters';

import { VoiceAgent, VoiceProvider } from '@/types/voiceAgent';

interface VoiceInterfaceProps {
  agent: VoiceAgent;
  onComplete?: () => void;
  onAlreadyAttempted?: () => void;
}

interface TranscriptMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  turnId?: number;
}

interface EndSessionOptions {
  notifyComplete?: boolean;
  cancelProviderSession?: boolean;
}

type MistralTransport = 'webrtc' | 'websocket';

export function VoiceInterface({ agent, onComplete, onAlreadyAttempted }: VoiceInterfaceProps) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isMistralSessionActiveRef = useRef(false);
  const mistralTransportRef = useRef<MistralTransport>('webrtc');
  const currentConversationIdRef = useRef<string | null>(null);
  const isEndingRef = useRef(false);
  const examStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimerRef = useRef<(() => void) | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollTranscriptRef = useRef(true);
  const handleEndRef = useRef<
    ((endedReason?: string, options?: EndSessionOptions) => Promise<void>) | null
  >(null);

  const maxDuration = agent.maxDurationSeconds;

  // TanStack Query mutations
  const getSignedUrlMutation = useGetSignedUrl();
  const startConversationMutation = useStartConversation();
  const endConversationMutation = useEndConversation();
  const cancelConversationMutation = useCancelConversation();

  const handleTranscriptScroll = useCallback(() => {
    const container = transcriptScrollRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollTranscriptRef.current = distanceFromBottom < 96;
  }, []);

  useEffect(() => {
    if (!shouldAutoScrollTranscriptRef.current) return;
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const conversation = useConversation({
    onConnect: () => {
      setLocalError(null);
    },
    onDisconnect: () => {
      // Connection ended
    },
    onMessage: (message: unknown) => {
      const content =
        typeof message === 'string' ? message : (message as { message?: string }).message;

      if (content) {
        const source =
          typeof message === 'object' && message !== null && 'source' in message
            ? (message as { source?: string }).source
            : 'agent';

        setMessages(prev => [
          ...prev,
          {
            role: source === 'user' ? 'user' : 'agent',
            content,
            timestamp: new Date(),
          },
        ]);
      }
    },
    onError: (err: unknown) => {
      console.error('ElevenLabs error:', err);
      const errorMessage =
        typeof err === 'string' ? err : (err as Error)?.message || 'An error occurred';
      setLocalError(errorMessage);
    },
  });

  const stopMicrophone = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const handlePipecatMessage = useCallback(
    (message: {
      type?: string;
      role?: 'user' | 'agent';
      message?: string;
      content?: string;
      turnId?: number;
    }) => {
      if (message.type === 'agent_audio_started') {
        startTimerRef.current?.();
        return;
      }

      const content = message.message || message.content;
      if (!content) return;
      const role = message.role === 'user' ? 'user' : 'agent';

      if (message.type === 'transcript_update' && role === 'agent' && message.turnId) {
        setMessages(prev => {
          const existingIndex = prev.findIndex(
            item => item.role === 'agent' && item.turnId === message.turnId
          );
          const updatedMessage: TranscriptMessage = {
            role: 'agent',
            content,
            timestamp: new Date(),
            turnId: message.turnId,
          };

          if (existingIndex === -1) {
            return [...prev, updatedMessage];
          }

          return prev.map((item, index) => (index === existingIndex ? updatedMessage : item));
        });
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          role,
          content,
          timestamp: new Date(),
        },
      ]);
    },
    []
  );

  const {
    status: pipecatStatus,
    isSpeaking: pipecatIsSpeaking,
    isListening: pipecatIsListening,
    startSession: startPipecatSession,
    endSession: endPipecatSession,
  } = usePipecatVoiceSession({
    onConnect: () => {
      setLocalError(null);
    },
    onMessage: handlePipecatMessage,
    onError: err => {
      console.error('Pipecat voice runtime error:', err);
      setLocalError(err.message || 'An error occurred');
    },
  });

  const {
    status: pipecatWebRTCStatus,
    isSpeaking: pipecatWebRTCIsSpeaking,
    isListening: pipecatWebRTCIsListening,
    startSession: startPipecatWebRTCSession,
    endSession: endPipecatWebRTCSession,
  } = usePipecatWebRTCSession({
    onConnect: () => {
      setLocalError(null);
    },
    onMessage: handlePipecatMessage,
    onError: err => {
      console.error('Pipecat WebRTC runtime error:', err);
      setLocalError(err.message || 'An error occurred');
    },
    playRuntimeTtsAudio: true,
  });

  // Mistral always runs through the full-duplex Pipecat runtime.
  const isMistral = agent.voiceProvider === VoiceProvider.MistralVoice;

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) return;
    stopTimer();
    examStartTimeRef.current = Date.now();
    setElapsedSeconds(0);
    timerIntervalRef.current = setInterval(() => {
      if (!examStartTimeRef.current) return;
      const elapsed = Math.floor((Date.now() - examStartTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
      if (maxDuration > 0 && elapsed >= maxDuration) {
        handleEndRef.current?.();
      }
    }, 1000);
  }, [maxDuration, stopTimer]);

  useEffect(() => {
    startTimerRef.current = startTimer;
  }, [startTimer]);

  const setActiveConversationId = useCallback((conversationId: string | null) => {
    currentConversationIdRef.current = conversationId;
  }, []);

  // Cleanup active provider session, microphone, and timer on unmount.
  useEffect(() => {
    return () => {
      void handleEndRef.current?.('route_change', {
        cancelProviderSession: true,
        notifyComplete: false,
      });
    };
  }, []);

  const handleStart = useCallback(async () => {
    try {
      shouldAutoScrollTranscriptRef.current = true;
      setMessages([]);
      setLocalError(null);

      // Check eligibility first (signed URL request will fail if already attempted)
      const signedUrlResult = await getSignedUrlMutation.mutateAsync(agent.id);

      if (signedUrlResult.provider === VoiceProvider.MistralVoice) {
        if (!signedUrlResult.token || !signedUrlResult.sessionId) {
          setLocalError('Failed to get Mistral voice session details');
          return;
        }

        isMistralSessionActiveRef.current = true;
        setActiveConversationId(signedUrlResult.sessionId);
        if (signedUrlResult.transportMode === 'webrtc' && signedUrlResult.webrtcUrl) {
          try {
            mistralTransportRef.current = 'webrtc';
            await startPipecatWebRTCSession({
              webrtcUrl: signedUrlResult.webrtcUrl,
              token: signedUrlResult.token,
              iceServers: signedUrlResult.iceServers,
            });
            return;
          } catch (webrtcError) {
            if (!signedUrlResult.transportUrl) {
              throw webrtcError;
            }
            console.warn('Pipecat WebRTC failed; falling back to WebSocket', webrtcError);
            setLocalError(null);
          }
        }

        if (signedUrlResult.transportUrl) {
          mistralTransportRef.current = 'websocket';
          await startPipecatSession({
            transportUrl: signedUrlResult.transportUrl,
            token: signedUrlResult.token,
          });
        } else {
          setLocalError('Failed to get Mistral voice transport details');
          return;
        }

        return;
      }

      if (!signedUrlResult?.signedUrl) {
        setLocalError('Failed to get signed URL');
        return;
      }

      // Only request microphone after confirming eligibility
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Start ElevenLabs session with signed URL
      const conversationIdResult = await conversation.startSession({
        signedUrl: signedUrlResult.signedUrl,
      });

      if (conversationIdResult) {
        setActiveConversationId(conversationIdResult);
        startTimer();

        // Record conversation start in backend (non-blocking so a backend
        // failure doesn't tear down the already-live ElevenLabs session)
        startConversationMutation.mutate({
          agentId: agent.id,
          conversationId: conversationIdResult,
        });
      }
    } catch (err) {
      console.error('Failed to start session:', err);
      const conversationId = currentConversationIdRef.current;
      if (isMistralSessionActiveRef.current && conversationId) {
        void cancelConversationMutation.mutateAsync({
          agentId: agent.id,
          conversationId,
          endedReason: 'start_failed',
        });
      }
      isMistralSessionActiveRef.current = false;
      setActiveConversationId(null);
      stopMicrophone();
      const message = err instanceof Error ? err.message : 'Failed to start session';
      // Check if this is an "already attempted" error from the backend
      if (
        (message.includes('already completed') || message.includes('maximum number of attempts')) &&
        onAlreadyAttempted
      ) {
        onAlreadyAttempted();
        return;
      }
      setLocalError(message);
    }
  }, [
    agent.id,
    cancelConversationMutation,
    conversation,
    getSignedUrlMutation,
    onAlreadyAttempted,
    setActiveConversationId,
    startPipecatSession,
    startPipecatWebRTCSession,
    startConversationMutation,
    startTimer,
    stopMicrophone,
  ]);

  const handleEnd = useCallback(
    async (endedReason = 'manual_end', options?: EndSessionOptions) => {
      if (isEndingRef.current) return;
      const shouldNotifyComplete = options?.notifyComplete ?? true;
      const shouldCancelProviderSession = options?.cancelProviderSession ?? false;
      const conversationId = currentConversationIdRef.current;
      const hasActiveSession =
        (isMistral && isMistralSessionActiveRef.current) ||
        (!isMistral && conversation.status === 'connected');

      if (!hasActiveSession && !conversationId) return;

      isEndingRef.current = true;
      try {
        stopTimer();
        if (isMistral) {
          isMistralSessionActiveRef.current = false;
          if (mistralTransportRef.current === 'webrtc') {
            await endPipecatWebRTCSession(
              endedReason,
              shouldCancelProviderSession ? 'cancel' : 'end'
            );
          } else {
            await endPipecatSession(endedReason, shouldCancelProviderSession ? 'cancel' : 'end');
          }
        } else {
          await conversation.endSession();
        }
        stopMicrophone();

        if (conversationId && isMistral && shouldCancelProviderSession) {
          await cancelConversationMutation.mutateAsync({
            agentId: agent.id,
            conversationId,
            endedReason,
          });
        }

        if (conversationId && agent.voiceProvider === VoiceProvider.ElevenLabs) {
          // Record conversation end and fetch transcript
          await endConversationMutation.mutateAsync({
            agentId: agent.id,
            conversationId,
          });
        }

        setActiveConversationId(null);
        if (shouldNotifyComplete) {
          onComplete?.();
        }
      } catch (err) {
        console.error('Failed to end session:', err);
        stopMicrophone();
        if (isMistral && conversationId) {
          await cancelConversationMutation.mutateAsync({
            agentId: agent.id,
            conversationId,
            endedReason,
          });
          setActiveConversationId(null);
        }
        setLocalError(err instanceof Error ? err.message : 'Failed to end session');
      } finally {
        isEndingRef.current = false;
      }
    },
    [
      agent.id,
      agent.voiceProvider,
      cancelConversationMutation,
      conversation,
      endPipecatSession,
      endPipecatWebRTCSession,
      isMistral,
      endConversationMutation,
      onComplete,
      setActiveConversationId,
      stopMicrophone,
      stopTimer,
    ]
  );

  // Keep handleEndRef in sync so the timer can call it without stale closures
  useEffect(() => {
    handleEndRef.current = handleEnd;
  }, [handleEnd]);

  const activeMistralStatus =
    mistralTransportRef.current === 'webrtc' ? pipecatWebRTCStatus : pipecatStatus;
  const activeStatus = isMistral ? activeMistralStatus : conversation.status;
  const isMistralSessionOpen = isMistral && activeMistralStatus !== 'disconnected';
  const isMistralExamActive = isMistral && activeMistralStatus === 'active';
  const isMistralStarting =
    isMistral && ['connecting', 'runtimeReady'].includes(activeMistralStatus);
  const agentIsSpeaking = isMistral
    ? mistralTransportRef.current === 'webrtc'
      ? pipecatWebRTCIsSpeaking
      : pipecatIsSpeaking
    : conversation.isSpeaking;
  const voiceIsListening =
    mistralTransportRef.current === 'webrtc' ? pipecatWebRTCIsListening : pipecatIsListening;
  const isSessionActive = isMistral ? isMistralExamActive : activeStatus === 'connected';
  const hasOpenSession = isMistral ? isMistralSessionOpen : activeStatus === 'connected';
  const isConnecting = isMistral ? isMistralStarting : activeStatus === 'connecting';
  const isLoading = getSignedUrlMutation.isPending;
  const progress = maxDuration > 0 ? Math.min(elapsedSeconds / maxDuration, 1) : 0;
  const progressColor =
    progress < 0.75 ? 'bg-green-500' : progress < 0.9 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="border-border bg-card mb-6 rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground text-xl font-semibold">{agent.examTitle || agent.name}</h2>
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${
                isSessionActive
                  ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
                  : isConnecting
                    ? 'animate-pulse bg-yellow-500'
                    : 'bg-muted'
              }`}
            />
            <span className="text-muted-foreground text-sm">
              {activeStatus === 'runtimeReady' ? 'starting audio' : activeStatus}
            </span>
          </div>
        </div>

        {/* Instructions */}
        {agent.examInstructions && !hasOpenSession && (
          <div className="bg-muted mb-4 rounded-lg p-4">
            <h4 className="text-foreground/80 mb-2 text-sm font-medium">Instructions</h4>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {agent.examInstructions}
            </p>
          </div>
        )}

        {/* Error Display */}
        {localError && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">
            {localError}
          </div>
        )}

        {/* Exam Timer */}
        {isSessionActive && (
          <div className="border-border bg-muted mb-4 rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-foreground text-sm font-medium">
                {formatTimeInCall(elapsedSeconds)} / {formatTimeInCall(maxDuration)}
              </span>
              {progress >= 0.9 && (
                <span className="animate-pulse text-sm font-semibold text-red-500">
                  Time running out!
                </span>
              )}
            </div>
            <div className="bg-muted-foreground/20 h-2 w-full overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${progressColor}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSessionActive && (
          <div className="bg-muted mb-4 flex items-center gap-4 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Agent Speaking:</span>
              <span
                className={`font-medium ${
                  agentIsSpeaking ? 'text-green-500' : 'text-muted-foreground'
                }`}
              >
                {agentIsSpeaking ? 'Yes' : 'No'}
              </span>
            </div>
            {isMistral && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Listening:</span>
                <span
                  className={`font-medium ${
                    voiceIsListening ? 'text-green-500' : 'text-muted-foreground'
                  }`}
                >
                  {voiceIsListening ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={hasOpenSession || isLoading}
            className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
              hasOpenSession || isLoading
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
            }`}
          >
            {isLoading ? 'Preparing...' : isConnecting ? 'Starting...' : 'Start Exam'}
          </button>
          <button
            onClick={() => void handleEnd()}
            disabled={!hasOpenSession}
            className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
              !hasOpenSession
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'cursor-pointer bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            End Exam
          </button>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="border-border overflow-hidden rounded-lg border">
        <div className="border-border bg-muted border-b px-4 py-3">
          <h4 className="text-foreground/80 text-sm font-medium">Live Transcript</h4>
        </div>
        <div
          ref={transcriptScrollRef}
          onScroll={handleTranscriptScroll}
          className="bg-background h-[400px] space-y-3 overflow-y-auto p-4"
        >
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              Click "Start Exam" to begin. The transcript will appear here.
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-lg border-l-4 p-3 ${
                  msg.role === 'user'
                    ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20'
                }`}
              >
                <div
                  className={`mb-1 text-xs font-medium ${
                    msg.role === 'user'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {msg.role === 'user' ? 'You' : 'Examiner'}
                </div>
                <div className="text-foreground text-sm">{msg.content}</div>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
}

export default VoiceInterface;
