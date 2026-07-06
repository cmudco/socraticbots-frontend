/**
 * VoiceInterface component for conducting voice exams.
 * Uses the configured provider runtime for real-time voice conversations.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConversation } from '@elevenlabs/react';
import {
  Activity,
  CheckCircle2,
  Clock3,
  Loader2,
  Mic,
  Radio,
  Square,
  TimerReset,
  Volume2,
} from 'lucide-react';

import {
  useCancelConversation,
  useEndConversation,
  useGetSignedUrl,
  useStartConversation,
} from '@/hooks/queries/useVoiceAgents';
import { usePipecatWebRTCSession } from '@/hooks/usePipecatWebRTCSession';

import { cn } from '@/lib/utils';

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
  isFinal?: boolean;
}

interface EndSessionOptions {
  notifyComplete?: boolean;
  cancelProviderSession?: boolean;
}

export function VoiceInterface({ agent, onComplete, onAlreadyAttempted }: VoiceInterfaceProps) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [lastResponseGapMs, setLastResponseGapMs] = useState<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isMistralSessionActiveRef = useRef(false);
  const currentConversationIdRef = useRef<string | null>(null);
  const isEndingRef = useRef(false);
  const examStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimerRef = useRef<(() => void) | null>(null);
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollTranscriptRef = useRef(true);
  const lastUserFinalAtRef = useRef<number | null>(null);
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
      isFinal?: boolean;
      isProcessing?: boolean;
    }) => {
      if (message.type === 'agent_audio_started') {
        startTimerRef.current?.();
        setIsProcessingResponse(false);
        if (lastUserFinalAtRef.current) {
          setLastResponseGapMs(Date.now() - lastUserFinalAtRef.current);
          lastUserFinalAtRef.current = null;
        }
        return;
      }

      if (message.type === 'processing') {
        setIsProcessingResponse(Boolean(message.isProcessing));
        return;
      }

      if (message.type === 'interrupt') {
        setIsProcessingResponse(false);
        return;
      }

      const content = message.message || message.content;
      if (!content) return;
      const role = message.role === 'user' ? 'user' : 'agent';

      if (message.type === 'transcript_update' && role === 'user' && message.isFinal) {
        lastUserFinalAtRef.current = Date.now();
        setIsProcessingResponse(true);
      }

      if (message.type === 'transcript_update' && message.turnId) {
        setMessages(prev => {
          const existingIndex = prev.findIndex(
            item => item.role === role && item.turnId === message.turnId
          );
          const updatedMessage: TranscriptMessage = {
            role,
            content,
            timestamp: new Date(),
            turnId: message.turnId,
            isFinal: message.isFinal,
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
      setIsProcessingResponse(false);
      setLastResponseGapMs(null);
      lastUserFinalAtRef.current = null;

      // Check eligibility first (signed URL request will fail if already attempted)
      const signedUrlResult = await getSignedUrlMutation.mutateAsync(agent.id);

      if (signedUrlResult.provider === VoiceProvider.MistralVoice) {
        if (!signedUrlResult.token || !signedUrlResult.sessionId) {
          setLocalError('Failed to get Mistral voice session details');
          return;
        }

        isMistralSessionActiveRef.current = true;
        setActiveConversationId(signedUrlResult.sessionId);
        if (signedUrlResult.webrtcUrl) {
          await startPipecatWebRTCSession({
            webrtcUrl: signedUrlResult.webrtcUrl,
            token: signedUrlResult.token,
            iceServers: signedUrlResult.iceServers,
          });
          return;
        } else {
          setLocalError('Failed to get Mistral WebRTC session details');
          return;
        }
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
          await endPipecatWebRTCSession(
            endedReason,
            shouldCancelProviderSession ? 'cancel' : 'end'
          );
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

  const activeMistralStatus = pipecatWebRTCStatus;
  const activeStatus = isMistral ? activeMistralStatus : conversation.status;
  const isMistralSessionOpen = isMistral && activeMistralStatus !== 'disconnected';
  const isMistralExamActive = isMistral && activeMistralStatus === 'active';
  const isMistralStarting =
    isMistral && ['connecting', 'runtimeReady'].includes(activeMistralStatus);
  const agentIsSpeaking = isMistral ? pipecatWebRTCIsSpeaking : conversation.isSpeaking;
  const voiceIsListening = pipecatWebRTCIsListening;
  const isSessionActive = isMistral ? isMistralExamActive : activeStatus === 'connected';
  const hasOpenSession = isMistral ? isMistralSessionOpen : activeStatus === 'connected';
  const isConnecting = isMistral ? isMistralStarting : activeStatus === 'connecting';
  const isLoading = getSignedUrlMutation.isPending;
  const progress = maxDuration > 0 ? Math.min(elapsedSeconds / maxDuration, 1) : 0;
  const progressColor =
    progress < 0.75 ? 'bg-green-500' : progress < 0.9 ? 'bg-yellow-500' : 'bg-red-500';
  const minutesRemaining =
    maxDuration > 0 ? Math.max(0, Math.ceil((maxDuration - elapsedSeconds) / 60)) : null;
  const loopState = agentIsSpeaking
    ? 'speaking'
    : isProcessingResponse
      ? 'thinking'
      : voiceIsListening
        ? 'listening'
        : isConnecting
          ? 'connecting'
          : isSessionActive
            ? 'ready'
            : 'idle';
  const loopLabel: Record<typeof loopState, string> = {
    speaking: 'Examiner speaking',
    thinking: 'Preparing response',
    listening: 'Listening live',
    connecting: 'Connecting audio',
    ready: 'Ready',
    idle: 'Not started',
  };
  const loopIcon = {
    speaking: Volume2,
    thinking: Loader2,
    listening: Mic,
    connecting: Radio,
    ready: CheckCircle2,
    idle: Square,
  }[loopState];
  const LoopIcon = loopIcon;
  const responseGapSeconds =
    lastResponseGapMs == null ? null : `${(lastResponseGapMs / 1000).toFixed(2)}s`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/60 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 bg-slate-950/70 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.16em] text-slate-400 uppercase">
                <span>Voice exam</span>
                {isMistral && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">
                    Voxtral realtime STT
                  </span>
                )}
                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-violet-300">
                  Kokoro TTS
                </span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                {agent.examTitle || agent.name}
              </h2>
            </div>
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium',
                isSessionActive
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : isConnecting
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
              )}
            >
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  isSessionActive
                    ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]'
                    : isConnecting
                      ? 'animate-pulse bg-amber-400'
                      : 'bg-slate-500'
                )}
              />
              {activeStatus === 'runtimeReady' ? 'starting audio' : activeStatus}
            </div>
          </div>
        </div>

        {/* Instructions */}
        {agent.examInstructions && !hasOpenSession && (
          <div className="mx-5 mt-5 rounded-md border border-slate-800 bg-slate-900/70 p-4 sm:mx-6">
            <h4 className="mb-2 text-sm font-medium text-slate-200">Instructions</h4>
            <p className="text-sm whitespace-pre-wrap text-slate-400">{agent.examInstructions}</p>
          </div>
        )}

        {/* Error Display */}
        {localError && (
          <div className="mx-5 mt-5 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-red-200 sm:mx-6">
            {localError}
          </div>
        )}

        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-md border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Clock3 className="h-4 w-4 text-slate-400" />
                {formatTimeInCall(elapsedSeconds)} / {formatTimeInCall(maxDuration)}
              </div>
              {minutesRemaining != null && (
                <span className="text-xs text-slate-400">{minutesRemaining} min left</span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${progressColor}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            {progress >= 0.9 && (
              <div className="mt-3 text-sm font-medium text-red-300">Time running out</div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              className={cn(
                'rounded-md border p-4',
                loopState === 'listening'
                  ? 'border-blue-500/40 bg-blue-500/10'
                  : loopState === 'thinking'
                    ? 'border-amber-500/40 bg-amber-500/10'
                    : loopState === 'speaking'
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-900/70'
              )}
            >
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <LoopIcon className={cn('h-4 w-4', loopState === 'thinking' && 'animate-spin')} />
                Live state
              </div>
              <div className="text-lg font-semibold text-slate-50">{loopLabel[loopState]}</div>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-900/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Activity className="h-4 w-4 text-slate-400" />
                Response gap
              </div>
              <div className="text-lg font-semibold text-slate-50">
                {responseGapSeconds ?? 'waiting'}
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 border-t border-slate-800 bg-slate-950/50 p-5 sm:p-6">
          <button
            onClick={handleStart}
            disabled={hasOpenSession || isLoading}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold transition-all ${
              hasOpenSession || isLoading
                ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                : 'cursor-pointer bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            <Mic className="h-4 w-4" />
            {isLoading ? 'Preparing...' : isConnecting ? 'Starting...' : 'Start Exam'}
          </button>
          <button
            onClick={() => void handleEnd()}
            disabled={!hasOpenSession}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-6 py-3 font-semibold transition-all ${
              !hasOpenSession
                ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                : 'cursor-pointer bg-red-500 text-white hover:bg-red-400'
            }`}
          >
            <TimerReset className="h-4 w-4" />
            End Exam
          </button>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/60 shadow-xl shadow-black/10">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-5 py-4">
          <div>
            <h4 className="text-sm font-semibold tracking-[0.14em] text-slate-300 uppercase">
              Live Transcript
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Student speech streams live; examiner text updates when audio begins.
            </p>
          </div>
          {isProcessingResponse && (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              preparing reply
            </div>
          )}
        </div>
        <div
          ref={transcriptScrollRef}
          onScroll={handleTranscriptScroll}
          className="h-[520px] space-y-4 overflow-y-auto bg-slate-950/30 p-5"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <Radio className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-500">
                  Start the exam to open the live transcript.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`group rounded-md border p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'ml-auto max-w-[86%] border-blue-500/30 bg-blue-500/10'
                    : 'mr-auto max-w-[92%] border-violet-500/30 bg-violet-500/10'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div
                    className={`text-xs font-semibold tracking-[0.12em] uppercase ${
                      msg.role === 'user' ? 'text-blue-300' : 'text-violet-300'
                    }`}
                  >
                    {msg.role === 'user' ? 'You' : 'Examiner'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="text-[15px] leading-7 text-slate-100">{msg.content}</div>
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
