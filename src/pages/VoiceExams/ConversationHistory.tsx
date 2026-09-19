/**
 * Conversation History page.
 * Lists voice conversations for a specific agent.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, Clock, Download, MessageSquare, RefreshCw, Trash2 } from 'lucide-react';

import { useVoiceAgent } from '@/hooks/queries/useVoiceAgents';
import {
  useAgentConversations,
  useDeleteVoiceConversation,
  useExportAllTranscripts,
} from '@/hooks/queries/useVoiceConversations';

import { formatConversationStatus, getConversationStatusStyle } from '@/utils/conversationStatus';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/utils/toast';

import SessionOutcome from '@/components/VoiceExam/SessionOutcome';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { ConversationStatus, VoiceConversationListItem } from '@/types/voiceAgent';

const ConversationHistory: React.FC = () => {
  const { agentId: agentIdParam } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const agentId = parseInt(agentIdParam || '0');

  const { data: agent } = useVoiceAgent(agentId);
  const { data: conversations, isLoading, refetch, isFetching } = useAgentConversations(agentId);
  const exportAll = useExportAllTranscripts();
  const deleteConversation = useDeleteVoiceConversation();
  const [conversationToDelete, setConversationToDelete] =
    useState<VoiceConversationListItem | null>(null);
  const canDeleteConversations = agent?.permissions.canManageAccess ?? false;

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    try {
      await deleteConversation.mutateAsync({ id: conversationToDelete.id, agentId });
      setConversationToDelete(null);
      toast.success('Conversation attempt deleted');
    } catch {
      toast.error('Failed to delete conversation attempt');
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = (status: ConversationStatus) => {
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getConversationStatusStyle(status)}`}
      >
        {formatConversationStatus(status)}
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
          onClick={() => navigate(`/voice-exams/${agentId}`)}
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {agent?.name || 'Agent'}
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold">Conversation History</h1>
            <p className="text-muted-foreground mt-1">
              {agent?.name
                ? `Conversations for "${agent.name}"`
                : 'View transcripts from voice assignment sessions'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => exportAll.mutate(agentId)}
              disabled={exportAll.isPending || !conversations || conversations.length === 0}
            >
              <Download className={`mr-2 h-4 w-4 ${exportAll.isPending ? 'animate-pulse' : ''}`} />
              {exportAll.isPending ? 'Exporting...' : 'Export All'}
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      {!conversations || conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="text-foreground mt-4 text-lg font-semibold">No conversations yet</h3>
            <p className="text-muted-foreground mt-2">
              When students complete this voice assignment, their conversations will appear here.
            </p>
            <Button onClick={() => navigate(`/voice-exams/${agentId}`)} className="mt-4">
              Back to Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map(conversation => (
            <Card
              key={conversation.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/voice-exams/${agentId}/conversations/${conversation.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{conversation.agentName}</CardTitle>
                    <CardDescription>{formatDate(conversation.startedAt)}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(conversation.status)}
                    {canDeleteConversations &&
                      conversation.status !== ConversationStatus.Reserved &&
                      conversation.status !== ConversationStatus.InProgress && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete conversation attempt by ${conversation.userEmail}`}
                          onClick={event => {
                            event.stopPropagation();
                            setConversationToDelete(conversation);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6 text-sm">
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
                <SessionOutcome
                  reason={conversation.endedReason}
                  activity={conversation.sessionActivity}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={conversationToDelete !== null}
        onOpenChange={open => !open && setConversationToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete conversation attempt?</DialogTitle>
            <DialogDescription>
              This will remove the attempt by {conversationToDelete?.userEmail} from conversation
              history and it will no longer count toward that student's attempt limit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConversationToDelete(null)}
              disabled={deleteConversation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConversation}
              disabled={deleteConversation.isPending}
            >
              {deleteConversation.isPending ? 'Deleting...' : 'Delete Attempt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationHistory;
