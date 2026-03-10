/**
 * TeamMembersPreview — shows team selector + members during agent creation,
 * with option to grant access to entire team or specific members.
 */
import React from 'react';

import { Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { GrantAccessMode } from '@/types/voiceAgent';
import type { VoiceTeamMembership, VoiceTeamWithMembers } from '@/types/voiceAgent';

interface TeamMembersPreviewProps {
  teams: VoiceTeamWithMembers[];
  selectedTeamId: number | null;
  onTeamChange: (teamId: number) => void;
  members: VoiceTeamMembership[];
  grantAccessMode: GrantAccessMode;
  selectedMemberUserIds: number[];
  onModeChange: (mode: GrantAccessMode) => void;
  onToggleMember: (userId: number) => void;
}

const TeamMembersPreview: React.FC<TeamMembersPreviewProps> = ({
  teams,
  selectedTeamId,
  onTeamChange,
  members,
  grantAccessMode,
  selectedMemberUserIds,
  onModeChange,
  onToggleMember,
}) => {
  if (teams.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
          {members.length > 0 && (
            <span className="text-muted-foreground text-sm font-normal">({members.length})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team selector — dropdown for multiple teams, read-only for single */}
        <div className="space-y-2">
          <Label>Team</Label>
          {teams.length === 1 ? (
            <p className="text-foreground text-sm font-medium">{teams[0].name}</p>
          ) : (
            <Select
              value={selectedTeamId !== null ? String(selectedTeamId) : ''}
              onValueChange={value => onTeamChange(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-muted-foreground text-xs">
            Team members will have access to this agent
          </p>
        </div>

        {/* Members and access mode — only shown when a team is selected */}
        {members.length > 0 && (
          <>
            {/* Access mode radio group */}
            <div className="space-y-2">
              <Label>Grant Access To</Label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="grantAccessMode"
                    value={GrantAccessMode.EntireTeam}
                    checked={grantAccessMode === GrantAccessMode.EntireTeam}
                    onChange={() => onModeChange(GrantAccessMode.EntireTeam)}
                    className="accent-primary"
                  />
                  <span className="text-foreground text-sm">Entire team</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="grantAccessMode"
                    value={GrantAccessMode.SpecificMembers}
                    checked={grantAccessMode === GrantAccessMode.SpecificMembers}
                    onChange={() => onModeChange(GrantAccessMode.SpecificMembers)}
                    className="accent-primary"
                  />
                  <span className="text-foreground text-sm">Select specific members</span>
                </label>
              </div>
              <p className="text-muted-foreground text-xs">
                {grantAccessMode === GrantAccessMode.EntireTeam
                  ? 'All team members will automatically have access to this agent.'
                  : 'Only selected members will be granted explicit access.'}
              </p>
            </div>

            {/* Member list */}
            <div className="space-y-2">
              {members.map(member => (
                <div
                  key={member.id}
                  className="border-border flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    {grantAccessMode === GrantAccessMode.SpecificMembers && (
                      <input
                        type="checkbox"
                        checked={selectedMemberUserIds.includes(member.user)}
                        onChange={() => onToggleMember(member.user)}
                        className="accent-primary h-4 w-4"
                      />
                    )}
                    <span className="text-foreground text-sm">{member.userEmail}</span>
                  </div>
                  <span className="text-muted-foreground rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize dark:bg-gray-800">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>

            {grantAccessMode === GrantAccessMode.SpecificMembers && (
              <p className="text-muted-foreground text-xs">
                {selectedMemberUserIds.length} of {members.length} members selected
              </p>
            )}
          </>
        )}

        {selectedTeamId !== null && members.length === 0 && (
          <p className="text-muted-foreground text-sm">No members in this team yet.</p>
        )}

        {selectedTeamId === null && teams.length > 1 && (
          <p className="text-muted-foreground text-sm">Select a team to see its members.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamMembersPreview;
