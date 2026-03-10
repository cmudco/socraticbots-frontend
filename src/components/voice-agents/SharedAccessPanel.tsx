/**
 * SharedAccessPanel — allows managers to grant/revoke access to team members.
 * Managers can only grant access to members of their team (not arbitrary emails).
 * Shows "Entire team" vs "Select specific members" toggle with member list.
 */
import React, { useMemo, useState } from 'react';

import { Check, Trash2, UserPlus, Users } from 'lucide-react';

import { voiceAgentService } from '@/services/voiceAgent.service';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type {
  AgentMembersResponse,
  VoiceAgentMembership,
  VoiceTeamMembership,
} from '@/types/voiceAgent';

interface SharedAccessPanelProps {
  agentId: number;
  hasTeam: boolean;
  members: AgentMembersResponse | null;
  onRefresh: () => void;
}

const SharedAccessPanel: React.FC<SharedAccessPanelProps> = ({
  agentId,
  hasTeam,
  members,
  onRefresh,
}) => {
  const [isGranting, setIsGranting] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [error, setError] = useState('');

  const teamMembers = useMemo(() => members?.teamMembers ?? [], [members]);
  const agentMembers = useMemo(() => members?.agentMembers ?? [], [members]);

  // Build a set of user IDs that already have agent-level access
  const agentMemberUserIds = useMemo(() => new Set(agentMembers.map(m => m.user)), [agentMembers]);

  // Team members who don't yet have explicit agent-level access
  const teamMembersWithoutAccess = useMemo(
    () => teamMembers.filter(m => !agentMemberUserIds.has(m.user)),
    [teamMembers, agentMemberUserIds]
  );

  const handleGrantAccess = async (member: VoiceTeamMembership) => {
    setError('');
    setIsGranting(member.user);
    try {
      await voiceAgentService.addAgentMember(agentId, member.userEmail, 'reviewer', 'agent');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to grant access';
      setError(msg);
    } finally {
      setIsGranting(null);
    }
  };

  const handleGrantAllTeamMembers = async () => {
    setError('');
    setIsGranting(-1); // sentinel for "granting all"
    try {
      for (const member of teamMembersWithoutAccess) {
        try {
          await voiceAgentService.addAgentMember(agentId, member.userEmail, 'reviewer', 'agent');
        } catch (err) {
          console.error(`Failed to grant access to ${member.userEmail}:`, err);
        }
      }
      onRefresh();
    } finally {
      setIsGranting(null);
    }
  };

  const handleRemoveAccess = async (membership: VoiceAgentMembership) => {
    setIsRemoving(membership.id);
    try {
      await voiceAgentService.removeAgentMember(agentId, membership.id, 'agent');
      onRefresh();
    } catch (err) {
      console.error('Failed to remove access:', err);
    } finally {
      setIsRemoving(null);
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
          Grant team members access to view transcripts or manage this agent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Team Members — grant access */}
        {hasTeam && teamMembers.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-foreground text-sm font-medium">
                Team Members ({teamMembers.length})
              </h4>
              {teamMembersWithoutAccess.length > 0 && (
                <Button
                  onClick={handleGrantAllTeamMembers}
                  disabled={isGranting !== null}
                  size="sm"
                  variant="outline"
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  {isGranting === -1 ? 'Granting...' : 'Grant All'}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {teamMembers.map((m: VoiceTeamMembership) => {
                const hasAccess = agentMemberUserIds.has(m.user);
                return (
                  <div
                    key={m.id}
                    className="border-border flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm">{m.userEmail}</span>
                      <span className="text-muted-foreground rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize dark:bg-gray-800">
                        {m.role}
                      </span>
                      {hasAccess && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          agent access
                        </span>
                      )}
                    </div>
                    {!hasAccess && (
                      <Button
                        onClick={() => handleGrantAccess(m)}
                        disabled={isGranting !== null}
                        size="sm"
                        variant="ghost"
                        className="h-8"
                      >
                        <UserPlus className="mr-1 h-3.5 w-3.5" />
                        {isGranting === m.user ? 'Granting...' : 'Grant'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            {teamMembersWithoutAccess.length === 0 && (
              <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                <Check className="h-3.5 w-3.5 text-green-500" />
                All team members have agent-level access.
              </p>
            )}
          </div>
        )}

        {/* Agent-Level Members — with remove option */}
        {agentMembers.length > 0 && (
          <div>
            <h4 className="text-foreground mb-2 text-sm font-medium">
              Agent-Level Access ({agentMembers.length})
            </h4>
            <div className="space-y-2">
              {agentMembers.map((m: VoiceAgentMembership) => (
                <div
                  key={m.id}
                  className="border-border flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div>
                    <span className="text-foreground text-sm">{m.userEmail}</span>
                    <span className="text-muted-foreground ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize dark:bg-gray-800">
                      {m.role}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveAccess(m)}
                    disabled={isRemoving === m.id}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                    title="Remove access"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No team case — fallback message */}
        {!hasTeam && agentMembers.length === 0 && (
          <p className="text-muted-foreground text-center text-sm">
            This agent is not assigned to a team. Assign it to a team to manage member access.
          </p>
        )}

        {hasTeam && teamMembers.length === 0 && agentMembers.length === 0 && (
          <p className="text-muted-foreground text-center text-sm">
            No team members found. Add members to the team first.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedAccessPanel;
