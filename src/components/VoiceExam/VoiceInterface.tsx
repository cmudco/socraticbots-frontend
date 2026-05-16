/**
 * VoiceInterface component for conducting voice exams.
 * Uses the configured provider runtime for real-time voice conversations.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConversation } from '@elevenlabs/react';

import {
  useEndConversation,
  useGetSignedUrl,
  useStartConversation,
} from '@/hooks/queries/useVoiceAgents';
import { useMistralVoiceSession } from '@/hooks/useMistralVoiceSession';

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
}

export function VoiceInterface({ agent, onComplete, onAlreadyAttempted }: VoiceInterfaceProps) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isMistralSessionActiveRef = useRef(false);
  const examStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleEndRef = useRef<(() => Promise<void>) | null>(null);

  const maxDuration = agent.maxDurationSeconds;

  // TanStack Query mutations
  const getSignedUrlMutation = useGetSignedUrl();
  const startConversationMutation = useStartConversation();
  const endConversationMutation = useEndConversation();

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

  const {
    status: mistralVoiceStatus,
    isSpeaking: mistralVoiceIsSpeaking,
    isListening: mistralIsListening,
    startSession: startMistralVoiceSession,
    endSession: endMistralVoiceSession,
  } = useMistralVoiceSession({
    onConnect: () => {
      setLocalError(null);
    },
    onMessage: message => {
      const content = message.message || message.content;
      if (!content) return;

      setMessages(prev => [
        ...prev,
        {
          role: message.role === 'user' ? 'user' : 'agent',
          content,
          timestamp: new Date(),
        },
      ]);
    },
    onError: err => {
      console.error('Mistral voice runtime error:', err);
      setLocalError(err.message || 'An error occurred');
    },
  });

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
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

  // Cleanup microphone and timer on unmount
  useEffect(() => {
    return () => {
      isMistralSessionActiveRef.current = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleStart = useCallback(async () => {
    try {
      setMessages([]);
      setLocalError(null);

      // Check eligibility first (signed URL request will fail if already attempted)
      const signedUrlResult = await getSignedUrlMutation.mutateAsync(agent.id);

      if (signedUrlResult.provider === VoiceProvider.MistralVoice) {
        if (!signedUrlResult.transportUrl || !signedUrlResult.token || !signedUrlResult.sessionId) {
          setLocalError('Failed to get Mistral voice session details');
          return;
        }

        isMistralSessionActiveRef.current = true;
        await startMistralVoiceSession({
          transportUrl: signedUrlResult.transportUrl,
          token: signedUrlResult.token,
        });

        setCurrentConversationId(signedUrlResult.sessionId);
        startTimer();
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
        setCurrentConversationId(conversationIdResult);
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
      isMistralSessionActiveRef.current = false;
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
    conversation,
    getSignedUrlMutation,
    onAlreadyAttempted,
    startMistralVoiceSession,
    startConversationMutation,
    startTimer,
    stopMicrophone,
  ]);

  const handleEnd = useCallback(async () => {
    try {
      stopTimer();
      if (agent.voiceProvider === VoiceProvider.MistralVoice) {
        isMistralSessionActiveRef.current = false;
        await endMistralVoiceSession();
      } else {
        await conversation.endSession();
      }
      stopMicrophone();

      if (currentConversationId && agent.voiceProvider === VoiceProvider.ElevenLabs) {
        // Record conversation end and fetch transcript
        await endConversationMutation.mutateAsync({
          agentId: agent.id,
          conversationId: currentConversationId,
        });
      }

      setCurrentConversationId(null);
      onComplete?.();
    } catch (err) {
      console.error('Failed to end session:', err);
      stopMicrophone();
      setLocalError(err instanceof Error ? err.message : 'Failed to end session');
    }
  }, [
    agent.id,
    agent.voiceProvider,
    currentConversationId,
    conversation,
    endMistralVoiceSession,
    endConversationMutation,
    onComplete,
    stopMicrophone,
    stopTimer,
  ]);

  // Keep handleEndRef in sync so the timer can call it without stale closures
  useEffect(() => {
    handleEndRef.current = handleEnd;
  }, [handleEnd]);

  const activeStatus =
    agent.voiceProvider === VoiceProvider.MistralVoice ? mistralVoiceStatus : conversation.status;
  const isSessionActive = activeStatus === 'connected';
  const isConnecting = activeStatus === 'connecting';
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
            <span className="text-muted-foreground text-sm">{activeStatus}</span>
          </div>
        </div>

        {/* Instructions */}
        {agent.examInstructions && !isSessionActive && (
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
                  (
                    agent.voiceProvider === VoiceProvider.MistralVoice
                      ? mistralVoiceIsSpeaking
                      : conversation.isSpeaking
                  )
                    ? 'text-green-500'
                    : 'text-muted-foreground'
                }`}
              >
                {(
                  agent.voiceProvider === VoiceProvider.MistralVoice
                    ? mistralVoiceIsSpeaking
                    : conversation.isSpeaking
                )
                  ? 'Yes'
                  : 'No'}
              </span>
            </div>
            {agent.voiceProvider === VoiceProvider.MistralVoice && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Listening:</span>
                <span
                  className={`font-medium ${
                    mistralIsListening ? 'text-green-500' : 'text-muted-foreground'
                  }`}
                >
                  {mistralIsListening ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={isSessionActive || isConnecting || isLoading}
            className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
              isSessionActive || isConnecting || isLoading
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
            }`}
          >
            {isLoading || isConnecting ? 'Connecting...' : 'Start Exam'}
          </button>
          <button
            onClick={handleEnd}
            disabled={!isSessionActive}
            className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
              !isSessionActive
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
        <div className="bg-background h-[400px] space-y-3 overflow-y-auto p-4">
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
        </div>
      </div>
    </div>
  );
}

export default VoiceInterface;
