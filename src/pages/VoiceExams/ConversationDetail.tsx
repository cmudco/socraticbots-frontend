/**
 * Conversation Detail page.
 * View a single conversation with transcript.
 */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, Bot, Clock, Download, RefreshCw, User } from 'lucide-react';

import {
  useExportTranscriptPdf,
  useSyncConversationTranscript,
  useVoiceConversation,
} from '@/hooks/queries/useVoiceConversations';

import { formatDate, formatDuration, formatTimeInCall } from '@/utils/formatters';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {
  ConversationStatus,
  TranscriptMessage,
  TranscriptRole,
  VoiceProvider,
} from '@/types/voiceAgent';

const STATUS_STYLES: { [K in ConversationStatus]: string } = {
  [ConversationStatus.Reserved]: 'bg-muted text-muted-foreground',
  [ConversationStatus.Completed]:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [ConversationStatus.InProgress]:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [ConversationStatus.Failed]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [ConversationStatus.Cancelled]: 'bg-muted text-muted-foreground',
};

const ConversationDetail: React.FC = () => {
  const { agentId: agentIdParam, id } = useParams<{ agentId: string; id: string }>();
  const navigate = useNavigate();
  const agentId = agentIdParam || '0';
  const conversationId = parseInt(id || '0');

  const { data: conversation, isLoading } = useVoiceConversation(conversationId);
  const syncTranscript = useSyncConversationTranscript();
  const exportPdf = useExportTranscriptPdf();

  const getStatusBadge = (status: ConversationStatus) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );

  const handleSyncTranscript = () => {
    syncTranscript.mutate(conversationId);
  };

  const handleDownloadTranscript = () => {
    exportPdf.mutate(conversationId);
  };

  const hasTranscript = conversation?.transcript && conversation.transcript.length > 0;
  const runtimeMetrics = conversation?.runtimeMetrics;
  const hasRuntimeMetrics = runtimeMetrics && Object.keys(runtimeMetrics).length > 0;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-foreground text-2xl font-bold">Conversation Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The conversation you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            onClick={() => navigate(`/voice-exams/${agentId}/conversations`)}
            className="mt-4"
          >
            Back to Conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/voice-exams/${agentId}/conversations`)}
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Conversations
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-foreground text-2xl font-bold">{conversation.agentName}</h1>
              {getStatusBadge(conversation.status)}
            </div>
            <p className="text-muted-foreground mt-1">{formatDate(conversation.startedAt)}</p>
          </div>
          <div className="flex gap-2">
            {hasTranscript && (
              <Button
                variant="outline"
                onClick={handleDownloadTranscript}
                disabled={exportPdf.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                {exportPdf.isPending ? 'Exporting...' : 'Download PDF'}
              </Button>
            )}
            {conversation.status === ConversationStatus.Completed &&
              !hasTranscript &&
              conversation.agentVoiceProvider === VoiceProvider.ElevenLabs && (
                <Button
                  variant="outline"
                  onClick={handleSyncTranscript}
                  disabled={syncTranscript.isPending}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${syncTranscript.isPending ? 'animate-spin' : ''}`}
                  />
                  Sync Transcript
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="text-primary h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Duration</p>
                <p className="text-foreground font-semibold">
                  {formatDuration(conversation.durationSeconds)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Started</p>
              <p className="text-foreground text-sm font-medium">
                {formatDate(conversation.startedAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ended</p>
              <p className="text-foreground text-sm font-medium">
                {conversation.endedAt ? formatDate(conversation.endedAt) : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasRuntimeMetrics && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Runtime Metrics</CardTitle>
            <CardDescription>Latency details captured by the voice runtime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-sm">Transport</p>
                <p className="text-foreground font-semibold">
                  {runtimeMetrics.transportMode ? runtimeMetrics.transportMode.toUpperCase() : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Runtime</p>
                <p className="text-foreground font-semibold">
                  {runtimeMetrics.runtime ? runtimeMetrics.runtime : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">STT Target Delay</p>
                <p className="text-foreground font-semibold">
                  {runtimeMetrics.sttTargetDelayMs !== undefined
                    ? `${runtimeMetrics.sttTargetDelayMs}ms`
                    : '-'}
                </p>
              </div>
            </div>
            <div className="grid gap-4 border-t pt-4 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-sm">Startup</p>
                <p className="text-foreground font-semibold">
                  {runtimeMetrics.startup?.totalSecs !== undefined
                    ? `${runtimeMetrics.startup.totalSecs.toFixed(2)}s`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">First Bot Speech</p>
                <p className="text-foreground font-semibold">
                  {runtimeMetrics.latency?.firstBotSpeechSecs !== undefined
                    ? `${runtimeMetrics.latency.firstBotSpeechSecs.toFixed(2)}s`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Last User-to-Bot</p>
                <p className="text-foreground font-semibold">
                  {runtimeMetrics.latency?.lastUserToBotSecs !== undefined
                    ? `${runtimeMetrics.latency.lastUserToBotSecs.toFixed(2)}s`
                    : '-'}
                </p>
              </div>
            </div>
            {runtimeMetrics.breakdowns && runtimeMetrics.breakdowns.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-muted-foreground mb-2 text-sm">Latest Breakdown</p>
                <div className="space-y-1">
                  {runtimeMetrics.breakdowns[runtimeMetrics.breakdowns.length - 1].map(
                    (event, index) => (
                      <p key={`${event}-${index}`} className="text-muted-foreground text-xs">
                        {event}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
          <CardDescription>
            {hasTranscript
              ? `${conversation.transcript.length} messages`
              : 'No transcript available'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasTranscript ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {conversation.status === ConversationStatus.InProgress
                  ? 'Transcript will be available after the conversation ends.'
                  : 'No transcript available.'}
              </p>
              {conversation.status === ConversationStatus.Completed &&
                conversation.agentVoiceProvider === VoiceProvider.ElevenLabs && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleSyncTranscript}
                    disabled={syncTranscript.isPending}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${syncTranscript.isPending ? 'animate-spin' : ''}`}
                    />
                    Sync Transcript
                  </Button>
                )}
            </div>
          ) : (
            <div className="space-y-4">
              {conversation.transcript.map((message: TranscriptMessage, index: number) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === TranscriptRole.User ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.role === TranscriptRole.User
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.role === TranscriptRole.User ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === TranscriptRole.User
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    {message.timeInCallSecs !== undefined && (
                      <p
                        className={`mt-1 text-xs ${
                          message.role === TranscriptRole.User
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatTimeInCall(message.timeInCallSecs)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationDetail;
