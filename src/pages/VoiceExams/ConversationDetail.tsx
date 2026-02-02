/**
 * Conversation Detail page.
 * View a single conversation with transcript.
 */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, Bot, Clock, RefreshCw, User } from 'lucide-react';

import {
  useSyncConversationTranscript,
  useVoiceConversation,
} from '@/hooks/queries/useVoiceConversations';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { TranscriptMessage } from '@/types/voiceAgent';

const ConversationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const conversationId = parseInt(id || '0');

  const { data: conversation, isLoading } = useVoiceConversation(conversationId);
  const syncTranscript = useSyncConversationTranscript();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimeInCall = (seconds?: number) => {
    if (seconds === undefined) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };

    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.cancelled}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  const handleSyncTranscript = () => {
    syncTranscript.mutate(conversationId);
  };

  const hasTranscript = conversation?.transcript && conversation.transcript.length > 0;

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
          <Button onClick={() => navigate('/voice-exams/conversations')} className="mt-4">
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
          onClick={() => navigate('/voice-exams/conversations')}
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
          {conversation.status === 'completed' && !hasTranscript && (
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

      {/* Stats */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
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
                {conversation.status === 'in_progress'
                  ? 'Transcript will be available after the conversation ends.'
                  : 'No transcript available. Try syncing from ElevenLabs.'}
              </p>
              {conversation.status === 'completed' && (
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
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    {message.time_in_call_secs !== undefined && (
                      <p
                        className={`mt-1 text-xs ${
                          message.role === 'user'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatTimeInCall(message.time_in_call_secs)}
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
