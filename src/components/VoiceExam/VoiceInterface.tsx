/**
 * VoiceInterface component for conducting voice exams.
 * Uses the configured provider runtime for real-time voice conversations.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { REPLY_PENDING_LABELS, ReplyPendingStage } from '@/constants/voiceExam';
import {
  SpeechRecoveryEvent,
  SpeechRecoveryMessageType,
  speechRecoveryCaption,
} from '@/constants/voiceRecovery';
import { VOICE_STAGE_COPY } from '@/constants/voiceStages';
import { useConversation } from '@elevenlabs/react';
import { AlertCircle, Clock3, Loader2, Mic, Square } from 'lucide-react';

import {
  useCancelConversation,
  useEndConversation,
  useGetSignedUrl,
  useStartConversation,
} from '@/hooks/queries/useVoiceAgents';
import { useMicrophoneDevices } from '@/hooks/useMicrophoneDevices';
import { usePipecatWebRTCSession } from '@/hooks/usePipecatWebRTCSession';
import { useVoiceFeedback } from '@/hooks/useVoiceFeedback';

import { cn } from '@/lib/utils';

import { formatTimeInCall } from '@/utils/formatters';

import BackupSpeechControl from '@/components/VoiceExam/BackupSpeechControl';
import MicrophoneSelect from '@/components/VoiceExam/MicrophoneSelect';
import ReplyLatencyBreakdown from '@/components/VoiceExam/ReplyLatencyBreakdown';
import { ThinkingDots, VoiceActivityBars } from '@/components/VoiceExam/indicators';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { PipecatProcessingStage, PipecatVoiceMessage } from '@/types/pipecat';
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

type LiveState =
  | 'speaking'
  | 'thinking'
  | 'listening'
  | 'connecting'
  | 'ready'
  | 'idle'
  | 'interrupted'
  | 'resuming';

interface ElevenLabsInputFormat {
  format: 'pcm' | 'ulaw';
  sampleRate: number;
}

/**
 * ElevenLabs reports the negotiated capture format as e.g. "pcm_16000". Its
 * mid-call device switch rebuilds the input at whatever format we hand it, so
 * this has to be the live value, not a guess.
 */
const ELEVENLABS_DEFAULT_INPUT_FORMAT: ElevenLabsInputFormat = { format: 'pcm', sampleRate: 16000 };

const parseElevenLabsInputFormat = (value?: string): ElevenLabsInputFormat | null => {
  const match = /^(pcm|ulaw)_(\d+)$/.exec(value ?? '');
  if (!match) return null;
  return { format: match[1] as 'pcm' | 'ulaw', sampleRate: Number(match[2]) };
};

const LIVE_STATE_META: Record<
  LiveState,
  { label: string; caption: string; tint: string; iconWrap: string }
> = {
  speaking: {
    label: 'Agent speaking',
    caption: 'Listen to the question before replying.',
    tint: 'bg-primary/10',
    iconWrap: 'border-primary/30 bg-primary/10 text-primary',
  },
  thinking: {
    label: 'Preparing response',
    caption: 'The agent is considering your answer.',
    tint: 'bg-muted/60',
    iconWrap: 'border-border bg-background text-foreground/70',
  },
  listening: {
    label: 'Your turn — listening',
    caption: 'Speak naturally — your words stream in live.',
    tint: 'bg-chart-2/10',
    iconWrap: 'border-chart-2/30 bg-chart-2/10 text-chart-2',
  },
  connecting: {
    label: 'Connecting',
    caption: 'Setting up your audio session.',
    tint: 'bg-muted/40',
    iconWrap: 'border-border bg-background text-muted-foreground',
  },
  ready: {
    label: 'Your turn',
    caption: 'The agent has finished speaking and is waiting for you.',
    tint: '',
    iconWrap: 'border-border bg-background text-muted-foreground',
  },
  idle: {
    label: 'Not started',
    caption: 'Start when you are ready.',
    tint: '',
    iconWrap: 'border-border bg-background text-muted-foreground',
  },
  interrupted: {
    label: 'Paused — sound detected',
    caption:
      'Go ahead if you want to speak. If no words are detected, the agent will retry its reply.',
    tint: 'bg-muted/60',
    iconWrap: 'border-border bg-background text-foreground/70',
  },
  resuming: {
    label: 'Resuming the agent’s reply',
    caption: 'No words were detected. You do not need to repeat your answer.',
    tint: 'bg-muted/60',
    iconWrap: 'border-border bg-background text-foreground/70',
  },
};

export function VoiceInterface({ agent, onComplete, onAlreadyAttempted }: VoiceInterfaceProps) {
  const { receive: receiveFeedback, reset: resetFeedback, ...feedback } = useVoiceFeedback();
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [speechRecovery, setSpeechRecovery] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [interruptionState, setInterruptionState] = useState<'interrupted' | 'resuming' | null>(
    null
  );
  const [lastResponseGapMs, setLastResponseGapMs] = useState<number | null>(null);
  // Runtime-reported per-turn latencies (null until the runtime emits them on
  // agent_audio_started; the UI then shows the LLM/Voice split).
  const [lastReplyLatency, setLastReplyLatency] = useState<{
    llmSeconds: number | null;
    ttsSeconds: number | null;
  } | null>(null);
  const [processingStage, setProcessingStage] = useState<PipecatProcessingStage | null>(null);
  const [isEnding, setIsEnding] = useState(false);
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
  const elevenLabsInputFormatRef = useRef<ElevenLabsInputFormat>(ELEVENLABS_DEFAULT_INPUT_FORMAT);
  /** Device the live session is actually capturing from; null when idle. */
  const activeDeviceIdRef = useRef<string | null>(null);

  const maxDuration = agent.maxDurationSeconds;

  // Never prompts on mount: the exam only touches the microphone once the
  // student's eligibility is confirmed. Where access was granted before, the
  // device names are readable straight away.
  const mic = useMicrophoneDevices();

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
  }, [messages, isProcessingResponse]);

  const conversation = useConversation({
    onConnect: () => {
      setLocalError(null);
    },
    onConversationMetadata: metadata => {
      const parsed = parseElevenLabsInputFormat(metadata?.user_input_audio_format);
      if (parsed) elevenLabsInputFormatRef.current = parsed;
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
    (message: PipecatVoiceMessage) => {
      receiveFeedback(message);
      if (message.type === 'error') {
        setLocalError(
          message.error ??
            message.data?.error ??
            'The voice service encountered a problem. Please try again.'
        );
        setSpeechRecovery(null);
        setIsProcessingResponse(false);
        return;
      }
      if (message.type === 'end_unconfirmed') {
        setLocalError('Connection closed, but the server did not confirm the end of this session.');
        return;
      }
      if (message.type === 'agent_audio_started') {
        setInterruptionState(null);
        startTimerRef.current?.();
        setIsProcessingResponse(false);
        setProcessingStage(null);
        // Only record a breakdown when the runtime actually reported one.
        setLastReplyLatency(
          typeof message.llmLatencySeconds === 'number' ||
            typeof message.ttsLatencySeconds === 'number'
            ? {
                llmSeconds:
                  typeof message.llmLatencySeconds === 'number' ? message.llmLatencySeconds : null,
                ttsSeconds:
                  typeof message.ttsLatencySeconds === 'number' ? message.ttsLatencySeconds : null,
              }
            : null
        );
        if (lastUserFinalAtRef.current) {
          setLastResponseGapMs(Date.now() - lastUserFinalAtRef.current);
          lastUserFinalAtRef.current = null;
        }
        return;
      }

      if (message.type === 'processing') {
        if (message.isProcessing) setInterruptionState(null);
        const isProcessing = Boolean(message.isProcessing);
        setIsProcessingResponse(isProcessing);
        setProcessingStage(isProcessing ? (message.stage ?? null) : null);
        return;
      }

      if (message.type === 'interrupt') {
        setIsProcessingResponse(false);
        setProcessingStage(null);
        return;
      }

      if (message.type === SpeechRecoveryMessageType) {
        setSpeechRecovery(speechRecoveryCaption(message.event));
        if (
          message.event === SpeechRecoveryEvent.FALLBACK_RECOVERED ||
          message.event === SpeechRecoveryEvent.RECOVERED
        ) {
          setLocalError(null);
        }
        return;
      }
      if (message.type === 'turn_recovery') {
        setInterruptionState(message.state === 'paused' ? 'interrupted' : 'resuming');
        setIsProcessingResponse(message.state !== 'paused');
        return;
      }
      if (message.type === 'transcript_update' && message.role === 'user') {
        setInterruptionState(null);
        setSpeechRecovery(null);
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
    [receiveFeedback]
  );

  const {
    status: pipecatWebRTCStatus,
    isSpeaking: pipecatWebRTCIsSpeaking,
    isListening: pipecatWebRTCIsListening,
    startSession: startPipecatWebRTCSession,
    endSession: endPipecatWebRTCSession,
    switchAudioDevice: switchPipecatAudioDevice,
    requestSttFallback,
    sendControlMessage,
  } = usePipecatWebRTCSession({
    onConnect: () => {
      setLocalError(null);
    },
    onMessage: handlePipecatMessage,
    onDisconnect: () => {
      resetFeedback();
      stopTimer();
      isMistralSessionActiveRef.current = false;
      setIsProcessingResponse(false);
      setInterruptionState(null);
      setSpeechRecovery(null);
    },
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
        handleEndRef.current?.('time_limit');
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
      resetFeedback();
      shouldAutoScrollTranscriptRef.current = true;
      setMessages([]);
      setLocalError(null);
      setSpeechRecovery(null);
      setInterruptionState(null);
      setIsProcessingResponse(false);
      setProcessingStage(null);
      setLastResponseGapMs(null);
      setLastReplyLatency(null);
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
          activeDeviceIdRef.current = mic.selectedId;
          await startPipecatWebRTCSession({
            webrtcUrl: signedUrlResult.webrtcUrl,
            token: signedUrlResult.token,
            iceServers: signedUrlResult.iceServers,
            audioDeviceId: mic.selectedId || undefined,
          });
          // Permission has just been granted at the latest, so device labels
          // are readable now even if they were not when the page loaded.
          void mic.refresh();
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: mic.selectedId ? { deviceId: { exact: mic.selectedId } } : true,
      });
      mediaStreamRef.current = stream;
      void mic.refresh();

      // Start ElevenLabs session with signed URL
      activeDeviceIdRef.current = mic.selectedId;
      const conversationIdResult = await conversation.startSession({
        signedUrl: signedUrlResult.signedUrl,
        inputDeviceId: mic.selectedId || undefined,
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
      activeDeviceIdRef.current = null;
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
    mic,
    onAlreadyAttempted,
    setActiveConversationId,
    startPipecatWebRTCSession,
    startConversationMutation,
    startTimer,
    stopMicrophone,
    resetFeedback,
  ]);

  const handleEnd = useCallback(
    async (endedReason = 'manual_end', options?: EndSessionOptions) => {
      if (isEndingRef.current) return;
      let shouldNotifyComplete = options?.notifyComplete ?? true;
      const shouldCancelProviderSession = options?.cancelProviderSession ?? false;
      const conversationId = currentConversationIdRef.current;
      const hasActiveSession =
        (isMistral && isMistralSessionActiveRef.current) ||
        (!isMistral && conversation.status === 'connected');

      if (!hasActiveSession && !conversationId) return;

      isEndingRef.current = true;
      setIsEnding(true);
      activeDeviceIdRef.current = null;
      try {
        stopTimer();
        if (isMistral) {
          isMistralSessionActiveRef.current = false;
          const confirmed = await endPipecatWebRTCSession(
            endedReason,
            shouldCancelProviderSession ? 'cancel' : 'end'
          );
          if (!confirmed) shouldNotifyComplete = false;
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
        setIsEnding(false);
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
  const isEndingSession = isEnding || activeStatus === 'disconnecting';
  const progress = maxDuration > 0 ? Math.min(elapsedSeconds / maxDuration, 1) : 0;
  const isTimeCritical = maxDuration > 0 && progress >= 0.9;
  const minutesRemaining =
    maxDuration > 0 ? Math.max(0, Math.ceil((maxDuration - elapsedSeconds) / 60)) : null;
  const liveState: LiveState =
    isSessionActive && interruptionState
      ? interruptionState
      : agentIsSpeaking
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
  const stateMeta = LIVE_STATE_META[liveState];
  // Refine the generic "thinking" state when the runtime says which pipeline
  // phase it is waiting on (LLM text vs TTS audio).
  const effectiveStateMeta =
    isSessionActive && speechRecovery
      ? { ...stateMeta, label: 'Recovering speech recognition', caption: speechRecovery }
      : isSessionActive && feedback.stage && !interruptionState
        ? { ...stateMeta, ...VOICE_STAGE_COPY[feedback.stage] }
        : liveState === 'thinking' && processingStage === 'tts'
          ? { ...stateMeta, label: 'Preparing voice', caption: 'The agent is about to speak.' }
          : liveState === 'thinking' && processingStage === 'llm'
            ? {
                ...stateMeta,
                label: 'Agent thinking',
                caption: 'Working out the next question.',
              }
            : stateMeta;
  useEffect(() => {
    if (isSessionActive && feedback.stage && !interruptionState && !speechRecovery) {
      sendControlMessage({
        type: 'voice_stage_seen',
        voiceStage: feedback.stage,
        sequence: feedback.sequence,
      });
    }
  }, [
    isSessionActive,
    feedback.stage,
    feedback.sequence,
    interruptionState,
    speechRecovery,
    sendControlMessage,
  ]);
  const totalReplySeconds = lastResponseGapMs == null ? null : lastResponseGapMs / 1000;
  const replyLlmSeconds = lastReplyLatency?.llmSeconds ?? null;
  const replyTtsSeconds = lastReplyLatency?.ttsSeconds ?? null;
  // Transport/pipeline remainder — only meaningful when both segments exist
  // and it doesn't round away to nothing.
  const replyOtherSeconds =
    totalReplySeconds != null && replyLlmSeconds != null && replyTtsSeconds != null
      ? Math.max(0, totalReplySeconds - replyLlmSeconds - replyTtsSeconds)
      : null;
  const showReplyOther = replyOtherSeconds != null && replyOtherSeconds >= 0.1;
  const replyPendingStage: ReplyPendingStage | null = isProcessingResponse
    ? (processingStage ?? 'generic')
    : null;
  const connectionMeta = isEndingSession
    ? {
        label: 'Ending session',
        pill: 'border-border bg-muted text-muted-foreground',
        ping: false,
        pulse: false,
      }
    : isSessionActive
      ? {
          label: 'Connected',
          pill: 'border-primary/30 bg-primary/10 text-primary',
          ping: true,
          pulse: false,
        }
      : isConnecting
        ? {
            label: 'Connecting',
            pill: 'border-border bg-muted text-muted-foreground',
            ping: false,
            pulse: true,
          }
        : {
            label: 'Not started',
            pill: 'border-border bg-card text-muted-foreground',
            ping: false,
            pulse: false,
          };
  const showTranscriptEmptyState = messages.length === 0 && !isProcessingResponse;

  // Carry a microphone change into the live session — whether the student
  // picked it or the hardware followed a plug-in. The session already opened on
  // activeDeviceIdRef's device, so only a real difference triggers a swap.
  useEffect(() => {
    if (!hasOpenSession) return;
    const previousDeviceId = activeDeviceIdRef.current;
    if (previousDeviceId === null || previousDeviceId === mic.selectedId) return;

    const deviceId = mic.selectedId;
    activeDeviceIdRef.current = deviceId;

    void (async () => {
      try {
        if (isMistral) {
          await switchPipecatAudioDevice(deviceId || undefined);
        } else {
          const { format, sampleRate } = elevenLabsInputFormatRef.current;
          await conversation.changeInputDevice({
            format,
            sampleRate,
            inputDeviceId: deviceId || undefined,
          });
        }
        setLocalError(null);
      } catch (error) {
        console.error('Failed to switch microphone mid-session:', error);
        // Put the picker back on the microphone that is actually carrying the
        // exam, so what is shown and what is recorded never disagree.
        activeDeviceIdRef.current = previousDeviceId;
        mic.selectDevice(previousDeviceId);
        setLocalError(
          'Could not switch to that microphone — the session is still running on the previous one.'
        );
      }
    })();
  }, [conversation, hasOpenSession, isMistral, mic, switchPipecatAudioDevice]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              Voice assignment
            </span>
            {isMistral && (
              <>
                <Badge
                  variant="outline"
                  className="bg-card/80 text-foreground border-border/80 px-3 py-1 font-medium whitespace-nowrap"
                >
                  Voxtral STT
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-card/80 text-foreground border-border/80 px-3 py-1 font-medium whitespace-nowrap"
                >
                  Kokoro TTS
                </Badge>
              </>
            )}
          </div>
          <h2 className="text-foreground truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {agent.examTitle || agent.name}
          </h2>
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-300 lg:self-auto',
            connectionMeta.pill
          )}
        >
          <span className="relative flex h-2 w-2">
            {connectionMeta.ping && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
            )}
            <span
              className={cn(
                'relative inline-flex h-2 w-2 rounded-full bg-current',
                connectionMeta.pulse && 'animate-pulse'
              )}
            />
          </span>
          {connectionMeta.label}
        </div>
      </div>

      {/* Error Display */}
      {localError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive animate-in fade-in slide-in-from-top-1 mb-4 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm duration-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Live Transcript */}
        <div className="bg-card text-card-foreground order-2 flex flex-col overflow-hidden rounded-xl border shadow-sm lg:order-1">
          <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
            <div className="min-w-0">
              <h3 className="text-foreground text-sm font-semibold">Live transcript</h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Your speech streams in live; agent text appears as the audio plays.
              </p>
            </div>
            {isSessionActive && (agentIsSpeaking || voiceIsListening) && (
              <div
                className={cn(
                  'animate-in fade-in flex shrink-0 items-center gap-2 text-xs font-medium duration-200',
                  agentIsSpeaking ? 'text-primary' : 'text-chart-2'
                )}
              >
                <VoiceActivityBars active fast={agentIsSpeaking} className="h-3.5" />
                {agentIsSpeaking ? 'Speaking' : 'Listening'}
              </div>
            )}
          </div>
          <div
            ref={transcriptScrollRef}
            onScroll={handleTranscriptScroll}
            aria-label="Session transcript"
            className="h-[52vh] min-h-90 space-y-4 overflow-y-auto px-4 py-5 sm:px-5 lg:h-[calc(100vh-20rem)] lg:min-h-[26rem]"
          >
            {showTranscriptEmptyState ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                {isConnecting ? (
                  <>
                    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    <p className="text-muted-foreground text-sm">Connecting your audio session…</p>
                  </>
                ) : hasOpenSession ? (
                  <>
                    <VoiceActivityBars active className="text-chart-2 h-5 w-7" />
                    <p className="text-muted-foreground text-sm">
                      You&apos;re live — the agent will greet you in a moment.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bg-muted/50 flex h-11 w-11 items-center justify-center rounded-full border">
                      <Mic className="text-muted-foreground h-5 w-5" />
                    </div>
                    <p className="text-muted-foreground max-w-xs text-sm">
                      Your conversation will appear here once the session begins.
                    </p>
                    {agent.examInstructions && (
                      <div className="bg-background/60 mt-3 w-full max-w-md rounded-lg border p-4 text-left shadow-xs">
                        <h4 className="text-foreground mb-1.5 text-sm font-semibold">
                          Instructions
                        </h4>
                        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                          {agent.examInstructions}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const isInterim = isUser && msg.isFinal === false;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-1 duration-300',
                        isUser ? 'items-end' : 'items-start'
                      )}
                    >
                      <div className="flex items-baseline gap-2 px-1">
                        <span
                          className={cn(
                            'text-[11px] font-semibold tracking-wider uppercase',
                            isUser ? 'text-chart-2' : 'text-primary'
                          )}
                        >
                          {isUser ? 'You' : 'Agent'}
                        </span>
                        <span className="text-muted-foreground/70 text-[10px]">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'text-foreground max-w-[88%] rounded-lg border px-4 py-2.5 text-[15px] leading-7 whitespace-pre-wrap shadow-xs transition-opacity duration-300',
                          isUser
                            ? 'border-chart-2/25 bg-chart-2/10 rounded-tr-sm'
                            : 'border-border bg-muted/40 rounded-tl-sm',
                          isInterim && 'opacity-70'
                        )}
                      >
                        {msg.content}
                        {isInterim && (
                          <span
                            aria-hidden="true"
                            className="ml-1 inline-block h-3.5 w-0.5 animate-pulse rounded-full bg-current align-middle"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                {isProcessingResponse && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-start gap-1 duration-300">
                    <span className="text-primary px-1 text-[11px] font-semibold tracking-wider uppercase">
                      Agent
                    </span>
                    <div className="border-border bg-muted/40 flex items-center gap-2.5 rounded-lg rounded-tl-sm border px-4 py-3 shadow-xs">
                      <ThinkingDots className="text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">
                        {REPLY_PENDING_LABELS[replyPendingStage ?? 'generic']}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Controls & Status Panel */}
        <div className="order-1 lg:sticky lg:top-2 lg:order-2">
          <div className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
            {/* Live state */}
            <div
              className={cn(
                'flex items-center gap-3 border-b px-5 py-4 transition-colors duration-300',
                stateMeta.tint
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                  stateMeta.iconWrap
                )}
              >
                {liveState === 'speaking' ? (
                  <VoiceActivityBars active fast />
                ) : liveState === 'listening' ? (
                  <VoiceActivityBars active />
                ) : liveState === 'thinking' ? (
                  <ThinkingDots />
                ) : liveState === 'connecting' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : liveState === 'ready' ? (
                  <VoiceActivityBars active={false} />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-foreground text-sm font-semibold">
                  <span role="status" aria-live="polite">
                    {effectiveStateMeta.label}
                  </span>
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  {effectiveStateMeta.caption}
                </div>
              </div>
            </div>

            {/* Timer */}
            {isSessionActive && isMistral ? (
              <div className="border-b px-5 py-4">
                <BackupSpeechControl
                  available={feedback.backupAvailable}
                  provider={feedback.provider}
                  onSwitch={requestSttFallback}
                />
              </div>
            ) : null}
            <div className="space-y-2.5 border-b px-5 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-foreground flex items-center gap-1.5 text-sm font-medium tabular-nums">
                  <Clock3 className="text-muted-foreground h-3.5 w-3.5" />
                  {formatTimeInCall(elapsedSeconds)}
                  {maxDuration > 0 && (
                    <span className="text-muted-foreground font-normal">
                      / {formatTimeInCall(maxDuration)}
                    </span>
                  )}
                </span>
                {minutesRemaining != null && (
                  <span
                    className={cn(
                      'text-xs',
                      isTimeCritical ? 'text-destructive font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {minutesRemaining} min left
                  </span>
                )}
              </div>
              {maxDuration > 0 && (
                <div className="bg-secondary h-1.5 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-1000 ease-linear',
                      isTimeCritical ? 'bg-destructive' : 'bg-primary'
                    )}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}
              {(replyPendingStage || totalReplySeconds != null || hasOpenSession) && (
                <div className="min-h-4">
                  <ReplyLatencyBreakdown
                    totalReplySeconds={totalReplySeconds}
                    llmSeconds={replyLlmSeconds}
                    ttsSeconds={replyTtsSeconds}
                    otherSeconds={showReplyOther ? replyOtherSeconds : null}
                    pendingStage={replyPendingStage}
                  />
                </div>
              )}
            </div>

            {/* Microphone */}
            <div className="border-b px-5 py-4">
              <MicrophoneSelect
                mic={mic}
                disabled={isConnecting || isEndingSession}
                hint={
                  hasOpenSession
                    ? 'Changing this switches the live session over straight away.'
                    : 'Plug in a headset and we switch to it for you.'
                }
              />
            </div>

            {/* Controls */}
            <div className="space-y-2 px-5 py-4">
              {!hasOpenSession ? (
                <>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => void handleStart()}
                    disabled={isLoading || isConnecting}
                  >
                    {isLoading || isConnecting ? <Loader2 className="animate-spin" /> : <Mic />}
                    {isLoading ? 'Preparing…' : isConnecting ? 'Starting…' : 'Start'}
                  </Button>
                  <p className="text-muted-foreground text-center text-[11px]">
                    Your browser will ask for microphone access.
                  </p>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant={isSessionActive ? 'destructive' : 'outline'}
                    className="w-full"
                    onClick={() => void handleEnd()}
                    disabled={isEndingSession}
                  >
                    {isEndingSession ? <Loader2 className="animate-spin" /> : <Square />}
                    {isEndingSession ? 'Ending…' : isSessionActive ? 'End session' : 'Cancel'}
                  </Button>
                  <p className="text-muted-foreground text-center text-[11px]">
                    {isSessionActive
                      ? 'Ends the session and submits your attempt.'
                      : 'Stops connecting and releases the microphone.'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceInterface;
