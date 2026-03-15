/**
 * VoiceInterface component for conducting voice exams.
 * Uses ElevenLabs SDK for real-time voice conversations.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConversation } from '@elevenlabs/react';

import {
  useEndConversation,
  useGetSignedUrl,
  useStartConversation,
} from '@/hooks/queries/useVoiceAgents';

import { VoiceAgent } from '@/types/voiceAgent';

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
  const mediaStreamRef = useRef<MediaStream | null>(null);

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

  // Cleanup microphone on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStart = useCallback(async () => {
    try {
      setMessages([]);
      setLocalError(null);

      // Check eligibility first (signed URL request will fail if already attempted)
      const signedUrlResult = await getSignedUrlMutation.mutateAsync(agent.id);

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

        // Record conversation start in backend
        await startConversationMutation.mutateAsync({
          agentId: agent.id,
          conversationId: conversationIdResult,
        });
      }
    } catch (err) {
      console.error('Failed to start session:', err);
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
    startConversationMutation,
    stopMicrophone,
  ]);

  const handleEnd = useCallback(async () => {
    try {
      await conversation.endSession();
      stopMicrophone();

      if (currentConversationId) {
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
    currentConversationId,
    conversation,
    endConversationMutation,
    onComplete,
    stopMicrophone,
  ]);

  const isSessionActive = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';
  const isLoading = getSignedUrlMutation.isPending;

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
            <span className="text-muted-foreground text-sm">{conversation.status}</span>
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

        {/* Speaking Indicator */}
        {isSessionActive && (
          <div className="bg-muted mb-4 flex items-center gap-4 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Agent Speaking:</span>
              <span
                className={`font-medium ${
                  conversation.isSpeaking ? 'text-green-500' : 'text-muted-foreground'
                }`}
              >
                {conversation.isSpeaking ? 'Yes' : 'No'}
              </span>
            </div>
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
