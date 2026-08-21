/**
 * Create Voice Agent page.
 * Form for creating a new voice agent.
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Save } from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';
import { useCreateVoiceAgent, useMyTeams } from '@/hooks/queries/useVoiceAgents';

import { useVoiceAgentFormStore } from '@/stores/forms/voiceAgentFormStore';

import { Button } from '@/components/ui/button';
import {
  AIConfigSection,
  AdvancedSettingsSection,
  BasicInfoSection,
  ExamConfigSection,
  MistralAdvancedSection,
  ProviderSection,
} from '@/components/voice-agents/sections';

const VoiceAgentCreate: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const createAgent = useCreateVoiceAgent();
  const { data: myTeams } = useMyTeams();
  const canCreate =
    user?.isCreator || user?.hasSupervisorAccessForVoiceAgent || user?.isVoiceTeamManager || false;

  const {
    initNewAgent,
    validateForm,
    getFormData,
    isSubmitting,
    setSubmitting,
    resetForm,
    team,
    updateField,
  } = useVoiceAgentFormStore();

  // Initialize form on mount
  useEffect(() => {
    initNewAgent();
    return () => {
      resetForm();
    };
  }, [initNewAgent, resetForm]);

  // Auto-select team when there is exactly one
  useEffect(() => {
    if (myTeams && myTeams.length === 1 && team === null) {
      updateField('team', myTeams[0].id);
    }
  }, [myTeams, team, updateField]);

  // Redirect if the account cannot configure voice agents.
  useEffect(() => {
    if (user && !canCreate) {
      navigate('/voice-exams');
    }
  }, [user, canCreate, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const formData = getFormData();
      const result = await createAgent.mutateAsync(formData);
      if (result) {
        resetForm();
        navigate(`/voice-exams/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (user && !canCreate) {
    return null;
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
          Back to Voice Assignments
        </button>
        <h1 className="text-foreground text-2xl font-bold">Create Voice Agent</h1>
        <p className="text-muted-foreground mt-1">
          Configure a new voice agent for homework, reflections, or exams
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ProviderSection />
        <BasicInfoSection showAccessCode />
        <ExamConfigSection />
        <AIConfigSection />
        <MistralAdvancedSection />
        <AdvancedSettingsSection collapsible />

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/voice-exams')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VoiceAgentCreate;
