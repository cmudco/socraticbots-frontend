/**
 * Create Voice Agent page.
 * Form for creating a new ElevenLabs voice agent.
 */
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Save, Users } from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';
import { useCreateVoiceAgent, useMyTeams } from '@/hooks/queries/useVoiceAgents';

import { useVoiceAgentFormStore } from '@/stores/forms/voiceAgentFormStore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AIConfigSection,
  AdvancedSettingsSection,
  BasicInfoSection,
  ExamConfigSection,
} from '@/components/voice-agents/sections';

const VoiceAgentCreate: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const createAgent = useCreateVoiceAgent();
  const { data: myTeams, isLoading: teamsLoading } = useMyTeams();

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

  // Derive the member count for the selected team (for display)
  const selectedTeam = useMemo(() => {
    if (!myTeams || team === null) return null;
    return myTeams.find(t => t.id === team) ?? null;
  }, [myTeams, team]);

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

  // Redirect if not a creator/supervisor (managers also pass via isCreator)
  useEffect(() => {
    if (user && !user.isCreator && !user.hasSupervisorAccessForVoiceAgent) {
      navigate('/voice-exams');
    }
  }, [user, navigate]);

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

  if (user && !user.isCreator && !user.hasSupervisorAccessForVoiceAgent) {
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
          Back to Voice Exams
        </button>
        <h1 className="text-foreground text-2xl font-bold">Create Voice Agent</h1>
        <p className="text-muted-foreground mt-1">
          Configure a new ElevenLabs voice agent for exams
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoSection showAccessCode />
        <ExamConfigSection />
        <AIConfigSection />

        {/* Team Assignment */}
        {!teamsLoading && myTeams && myTeams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myTeams.length === 1 ? (
                <div>
                  <p className="text-foreground text-sm font-medium">{myTeams[0].name}</p>
                  <p className="text-muted-foreground text-xs">
                    {myTeams[0].members.length} member{myTeams[0].members.length !== 1 ? 's' : ''} —
                    manage access after creation
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Assign to team</Label>
                  <Select
                    value={team !== null ? String(team) : ''}
                    onValueChange={value => updateField('team', Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {myTeams.map(t => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTeam && (
                    <p className="text-muted-foreground text-xs">
                      {selectedTeam.members.length} member
                      {selectedTeam.members.length !== 1 ? 's' : ''} — manage access after creation
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
