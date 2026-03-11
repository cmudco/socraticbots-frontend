/**
 * SharedAccessPanel — the single unified panel for team assignment + member management.
 *
 * Sections:
 *  1. Team selector — assign or change the team this agent belongs to
 *  2. Team members — list with roles, remove button
 *  3. Add member — email input + role picker to add anyone to the team
 */
import React, { useMemo, useState } from 'react';

import { Loader2, Trash2, UserPlus, Users } from 'lucide-react';

import {
  useAddAgentMember,
  useAgentMembers,
  useMyTeams,
  useRemoveAgentMember,
  useUpdateVoiceAgent,
} from '@/hooks/queries/useVoiceAgents';

import { getErrorMessage } from '@/utils/errorHandler';
import { toast } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { VoiceTeamMembership } from '@/types/voiceAgent';

interface SharedAccessPanelProps {
  agentId: number;
  currentTeamId: number | null;
  currentTeamName: string | null;
}

const SharedAccessPanel: React.FC<SharedAccessPanelProps> = ({
  agentId,
  currentTeamId,
  currentTeamName,
}) => {
  const { data: myTeams } = useMyTeams();
  const { data: members } = useAgentMembers(agentId);
  const updateAgent = useUpdateVoiceAgent();
  const addMember = useAddAgentMember();
  const removeMember = useRemoveAgentMember();

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'manager' | 'reviewer'>('reviewer');
  const [removingId, setRemovingId] = useState<number | null>(null);

  const teams = myTeams ?? [];
  const teamMembers = members?.teamMembers ?? [];

  const selectedTeam = useMemo(() => {
    if (currentTeamId === null) return null;
    return teams.find(t => t.id === currentTeamId) ?? null;
  }, [teams, currentTeamId]);

  const handleTeamChange = async (teamId: number | null) => {
    try {
      await updateAgent.mutateAsync({ id: agentId, data: { team: teamId } });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAddMember = async () => {
    const email = newEmail.trim();
    if (!email) return;

    try {
      await addMember.mutateAsync({ agentId, email, role: newRole, scope: 'team' });
      setNewEmail('');
      setNewRole('reviewer');
      toast.success(`Added ${email} as ${newRole}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRemoveMember = async (membership: VoiceTeamMembership) => {
    setRemovingId(membership.id);
    try {
      await removeMember.mutateAsync({ agentId, membershipId: membership.id, scope: 'team' });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  const hasTeam = currentTeamId !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Shared Access
        </CardTitle>
        <CardDescription>Assign this agent to a team and manage who can access it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── Section 1: Team Assignment ── */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">Team</Label>
          {teams.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {currentTeamName
                ? `Assigned to "${currentTeamName}"`
                : 'No teams available. Ask an admin to create one.'}
            </p>
          ) : (
            <>
              <Select
                value={currentTeamId !== null ? String(currentTeamId) : 'none'}
                onValueChange={value => {
                  handleTeamChange(value === 'none' ? null : Number(value));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No team</SelectItem>
                  {teams.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({t.members.length} member{t.members.length !== 1 ? 's' : ''})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTeam && (
                <p className="text-muted-foreground text-xs">
                  All members of this team will have access to this agent based on their role.
                </p>
              )}
            </>
          )}
        </div>

        {/* ── Section 2: Team Members List ── */}
        {hasTeam && teamMembers.length > 0 && (
          <div className="space-y-3">
            <Label className="text-foreground text-sm font-medium">
              Members ({teamMembers.length})
            </Label>
            <div className="space-y-2">
              {teamMembers.map((m: VoiceTeamMembership) => (
                <div
                  key={m.id}
                  className="border-border flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm">{m.userEmail}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        m.role === 'manager'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(m)}
                    disabled={removingId === m.id}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                    title="Remove from team"
                  >
                    {removingId === m.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasTeam && teamMembers.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No members in this team yet. Add someone below.
          </p>
        )}

        {/* ── Section 3: Add Member ── */}
        {hasTeam && (
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">Add Member</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Select value={newRole} onValueChange={v => setNewRole(v as 'manager' | 'reviewer')}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={addMember.isPending || !newEmail.trim()}
                size="default"
              >
                {addMember.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              This person will be added to the team and will have access to all agents in it.
            </p>
          </div>
        )}

        {/* ── No team selected ── */}
        {!hasTeam && teams.length > 0 && (
          <p className="text-muted-foreground text-center text-sm">
            Select a team above to manage members.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedAccessPanel;
