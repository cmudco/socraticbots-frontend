/**
 * Voice Agent Detail page.
 * View and edit voice agent configuration.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArrowLeft, Clock, Edit2, MessageSquare, Play, Save, Trash2, X } from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';
import {
  useDeleteVoiceAgent,
  useUpdateVoiceAgent,
  useVoiceAgent,
} from '@/hooks/queries/useVoiceAgents';

import { useVoiceAgentFormStore } from '@/stores/forms/voiceAgentFormStore';

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
import {
  AIConfigSection,
  AdvancedSettingsSection,
  BasicInfoSection,
  ExamConfigSection,
} from '@/components/voice-agents/sections';

const VoiceAgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agentId = parseInt(id || '0');

  const user = useUser();
  const { data: agent, isLoading } = useVoiceAgent(agentId);
  const updateAgent = useUpdateVoiceAgent();
  const deleteAgent = useDeleteVoiceAgent();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    initEditAgent,
    validateForm,
    getFormData,
    isSubmitting,
    setSubmitting,
    resetForm,
    setShowAdvanced,
  } = useVoiceAgentFormStore();

  const isOwner = user?.id === agent?.user;
  const isVoiceAdmin = user?.hasSupervisorAccessForVoiceAgent ?? false;
  const canEdit = isOwner && isVoiceAdmin;
  const canTakeExam = agent?.status === 'active' || isOwner;

  // Initialize form when entering edit mode
  useEffect(() => {
    if (isEditing && agent) {
      initEditAgent(agent);
    }
  }, [isEditing, agent, initEditAgent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  const handleSave = async () => {
    if (!agent) return;

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const formData = getFormData();
      const result = await updateAgent.mutateAsync({ id: agent.id, data: formData });
      if (result) {
        setIsEditing(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update agent:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;
    await deleteAgent.mutateAsync(agent.id);
    navigate('/voice-exams');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetForm();
  };

  const handleStartEdit = () => {
    if (agent) {
      setShowAdvanced(!!agent.conversationConfig);
      setIsEditing(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-foreground text-2xl font-bold">Agent Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The voice agent you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/voice-exams')} className="mt-4">
            Back to Voice Exams
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
          onClick={() => navigate('/voice-exams')}
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Voice Exams
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-foreground text-2xl font-bold">{agent.name}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  agent.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {agent.status}
              </span>
            </div>
            {agent.examTitle && (
              <p className="text-muted-foreground mt-1 text-lg">{agent.examTitle}</p>
            )}
          </div>
          <div className="flex gap-2">
            {isVoiceAdmin && agent.conversationCount > 0 && (
              <Button
                onClick={() => navigate(`/voice-exams/${agent.id}/conversations`)}
                variant="outline"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                View Conversations
              </Button>
            )}
            {canTakeExam && (
              <Button onClick={() => navigate(`/voice-exams/${agent.id}/exam`)} variant="default">
                <Play className="mr-2 h-4 w-4" />
                Take Exam
              </Button>
            )}
            {canEdit && !isEditing && (
              <Button onClick={handleStartEdit} variant="outline">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate(`/voice-exams/${agent.id}/conversations`)}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-primary h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Conversations</p>
                <p className="text-foreground text-xl font-semibold">{agent.conversationCount}</p>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">Click to view history</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-muted-foreground text-sm">Max Duration</p>
                <p className="text-foreground text-xl font-semibold">
                  {Math.floor(agent.maxDurationSeconds / 60)} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div>
              <p className="text-muted-foreground text-sm">Created</p>
              <p className="text-foreground text-sm font-medium">{formatDate(agent.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-6">
          <BasicInfoSection showAccessCode={isVoiceAdmin} />
          <ExamConfigSection />
          <AIConfigSection />
          <AdvancedSettingsSection collapsible defaultOpen />

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-destructive hover:bg-destructive/10 border-destructive/50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Agent
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Description */}
          {agent.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{agent.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Exam Instructions */}
          {agent.examInstructions && (
            <Card>
              <CardHeader>
                <CardTitle>Exam Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {agent.examInstructions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* System Prompt (Owners only) */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>System Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{agent.systemPrompt}</p>
              </CardContent>
            </Card>
          )}

          {/* First Message */}
          {agent.firstMessage && (
            <Card>
              <CardHeader>
                <CardTitle>First Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{agent.firstMessage}</p>
              </CardContent>
            </Card>
          )}

          {/* Configuration Details (Owners only) */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 md:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground text-sm">Temperature</dt>
                    <dd className="text-foreground">{agent.temperature}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Voice ID</dt>
                    <dd className="text-foreground">{agent.voiceId || 'Default'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">ElevenLabs Agent ID</dt>
                    <dd className="text-foreground">
                      {agent.elevenlabsAgentId || 'Not configured'}
                    </dd>
                  </div>
                  {isVoiceAdmin && (
                    <div>
                      <dt className="text-muted-foreground text-sm">Student Access Code</dt>
                      <dd className="text-foreground font-mono">
                        {agent.accessCodeForAdmin || 'Not set'}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Advanced ElevenLabs Settings (Owners only) */}
          {isOwner && agent.conversationConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced ElevenLabs Settings</CardTitle>
                <CardDescription>
                  Fine-tune conversation behavior, voice output, and LLM settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Turn Settings */}
                  <div>
                    <dt className="text-muted-foreground text-sm">Eagerness</dt>
                    <dd className="text-foreground capitalize">
                      {agent.conversationConfig?.turn?.turnEagerness || 'normal'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Turn Timeout</dt>
                    <dd className="text-foreground">
                      {agent.conversationConfig?.turn?.turnTimeout || 7}s
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Spelling Patience</dt>
                    <dd className="text-foreground capitalize">
                      {agent.conversationConfig?.turn?.spellingPatience || 'auto'}
                    </dd>
                  </div>

                  {/* TTS Settings */}
                  <div>
                    <dt className="text-muted-foreground text-sm">Stability</dt>
                    <dd className="text-foreground">
                      {agent.conversationConfig?.tts?.stability ?? 0.5}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Speed</dt>
                    <dd className="text-foreground">
                      {agent.conversationConfig?.tts?.speed ?? 1.0}x
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-sm">Similarity Boost</dt>
                    <dd className="text-foreground">
                      {agent.conversationConfig?.tts?.similarityBoost ?? 0.75}
                    </dd>
                  </div>

                  {/* LLM Settings */}
                  <div>
                    <dt className="text-muted-foreground text-sm">LLM Model</dt>
                    <dd className="text-foreground font-mono text-sm">
                      {agent.conversationConfig?.agent?.prompt?.llm || 'default'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Voice Agent?</DialogTitle>
            <DialogDescription>
              This will permanently delete "{agent.name}" and all associated data. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteAgent.isPending}>
              {deleteAgent.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceAgentDetail;
