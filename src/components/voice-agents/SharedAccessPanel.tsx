/**
 * SharedAccessPanel — unified panel for managing team member access on a voice agent.
 *
 * Shows current team members, allows adding new members by email (to the team),
 * and removing existing members. All access is managed at the team level.
 */
import React, { useState } from 'react';

import { Loader2, Trash2, UserPlus, Users } from 'lucide-react';

import { voiceAgentService } from '@/services/voiceAgent.service';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { AgentMembersResponse, VoiceTeamMembership } from '@/types/voiceAgent';

interface SharedAccessPanelProps {
  agentId: number;
  teamName: string | null;
  members: AgentMembersResponse | null;
  onRefresh: () => void;
}

const SharedAccessPanel: React.FC<SharedAccessPanelProps> = ({
  agentId,
  teamName,
  members,
  onRefresh,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'manager' | 'reviewer'>('reviewer');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const teamMembers = members?.teamMembers ?? [];

  const handleAddMember = async () => {
    const email = newEmail.trim();
    if (!email) return;

    setError('');
    setSuccess('');
    setIsAdding(true);

    try {
      await voiceAgentService.addAgentMember(agentId, email, newRole, 'team');
      setNewEmail('');
      setNewRole('reviewer');
      setSuccess(`Added ${email} as ${newRole}`);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add member';
      setError(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (membership: VoiceTeamMembership) => {
    setError('');
    setSuccess('');
    setRemovingId(membership.id);

    try {
      await voiceAgentService.removeAgentMember(agentId, membership.id, 'team');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove member';
      setError(msg);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Shared Access
        </CardTitle>
        <CardDescription>
          {teamName
            ? `Manage members of "${teamName}" who can access this agent.`
            : 'This agent is not assigned to a team.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Feedback messages */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

        {/* Add member by email */}
        {teamName && (
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">Add Member</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={newEmail}
                onChange={e => {
                  setNewEmail(e.target.value);
                  setError('');
                  setSuccess('');
                }}
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
                disabled={isAdding || !newEmail.trim()}
                size="default"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Adding a member gives them access to all agents in this team.
            </p>
          </div>
        )}

        {/* Team Members List */}
        {teamMembers.length > 0 && (
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              Team Members ({teamMembers.length})
            </p>
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

        {/* Empty states */}
        {teamName && teamMembers.length === 0 && (
          <p className="text-muted-foreground text-center text-sm">
            No team members yet. Add members by email above.
          </p>
        )}

        {!teamName && (
          <p className="text-muted-foreground text-center text-sm">
            Assign this agent to a team to manage member access.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedAccessPanel;
