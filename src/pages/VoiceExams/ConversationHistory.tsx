/**
 * Conversation History page.
 * Lists all voice conversations for the user.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Clock, MessageSquare, RefreshCw } from 'lucide-react';

import { useVoiceConversations } from '@/hooks/queries/useVoiceConversations';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ConversationHistory: React.FC = () => {
  const navigate = useNavigate();
  const { data: conversations, isLoading, refetch, isFetching } = useVoiceConversations();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-muted text-muted-foreground',
    };

    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.cancelled}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/voice-exams')}
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Voice Exams
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Conversation History</h1>
            <p className="text-muted-foreground mt-1">
              View transcripts from your voice exam sessions
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      {!conversations || conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="text-foreground mt-4 text-lg font-semibold">No conversations yet</h3>
            <p className="text-muted-foreground mt-2">
              When you complete voice exams, your conversations will appear here.
            </p>
            <Button onClick={() => navigate('/voice-exams')} className="mt-4">
              Browse Voice Exams
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map(conversation => (
            <Card
              key={conversation.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/voice-exams/conversations/${conversation.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{conversation.agentName}</CardTitle>
                    <CardDescription>{formatDate(conversation.startedAt)}</CardDescription>
                  </div>
                  {getStatusBadge(conversation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {formatDuration(conversation.durationSeconds)}</span>
                  </div>
                  {conversation.userEmail && (
                    <div className="text-muted-foreground">
                      <span>User: {conversation.userEmail}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;
