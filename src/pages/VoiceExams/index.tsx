/**
 * VoiceExams list page.
 * Shows all voice agents the user can access via any role.
 * Admins/managers can create/import agents and manage exams.
 * Students see an access code input to unlock exams.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Clock, Download, Mic, Plus, Shield, User, Users } from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';
import { useVoiceAgents } from '@/hooks/queries/useVoiceAgents';

import { formatShortDate } from '@/utils/formatters';
import { ROLE_BADGE_STYLES } from '@/utils/voiceAgentStyles';

import { AgentStatus } from '@/types/voiceAgent';

import ImportSection from './ImportSection';
import RedeemAccessCodeForm from './RedeemAccessCodeForm';

const DESCRIPTIONS = {
  admin: 'Create, configure, and launch voice agents for exams',
  student: 'Take voice-based exams',
  redeemUnlock: 'Enter another access code to unlock a different voice exam.',
  redeemFirst: 'Enter the access code provided by your instructor to unlock your exam.',
  emptyPrompt: 'Use the access code below to unlock your exam.',
  setupUnavailable:
    'Voice agent setup is available to Creator, supervisor, and voice team manager accounts.',
} as const;

const VoiceExamsList: React.FC = () => {
  const user = useUser();
  const { data: agents, isLoading } = useVoiceAgents();

  const canCreate =
    user?.isCreator || user?.hasSupervisorAccessForVoiceAgent || user?.isVoiceTeamManager || false;
  const canRedeemAccessCode = !!user && !canCreate;

  // Hide draft exams from students — only creators/managers see drafts
  const visibleAgents = canCreate
    ? agents
    : agents?.filter(agent => agent.status === AgentStatus.Active);
  const hasAgents = !!visibleAgents && visibleAgents.length > 0;

  const [showImportSection, setShowImportSection] = useState(false);

  const redeemTitle = hasAgents ? 'Unlock Another Exam' : 'Enter Your Exam Code';
  const redeemDescription = hasAgents ? DESCRIPTIONS.redeemUnlock : DESCRIPTIONS.redeemFirst;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Voice Exams</h1>
          <p className="text-muted-foreground mt-1">
            {canCreate ? DESCRIPTIONS.admin : DESCRIPTIONS.student}
          </p>
        </div>
        <div className="flex gap-3">
          {canCreate && (
            <>
              <button
                onClick={() => setShowImportSection(!showImportSection)}
                className="border-border text-foreground hover:bg-accent flex items-center gap-2 rounded-lg border px-4 py-2"
              >
                <Download className="h-4 w-4" />
                Import
              </button>
              <Link
                to="/voice-exams/create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2"
              >
                <Plus className="h-4 w-4" />
                Create Agent
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Import Section (Voice admins only) */}
      {canCreate && showImportSection && <ImportSection canCreate={canCreate} />}

      {/* Agents Grid */}
      {hasAgents ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleAgents.map(agent => (
            <Link
              key={agent.id}
              to={`/voice-exams/${agent.id}`}
              className="border-border bg-card group flex h-full flex-col rounded-lg border p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Mic className="text-primary h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  {agent.accessLevel && agent.accessLevel !== 'student' && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_STYLES[agent.accessLevel] || ''}`}
                    >
                      <Shield className="h-3 w-3" />
                      {agent.accessLevel}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      agent.status === AgentStatus.Active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
              </div>

              <h3 className="text-foreground group-hover:text-primary mb-2 text-lg font-semibold">
                {agent.name}
              </h3>

              {agent.examTitle && (
                <p className="text-foreground/80 mb-2 text-sm font-medium">{agent.examTitle}</p>
              )}

              <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                {agent.description || 'No description provided'}
              </p>

              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                {agent.teamName && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {agent.teamName}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {agent.userEmail}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatShortDate(agent.createdAt)}
                </div>
              </div>
            </Link>
          ))}

          {/* Redeem card inside grid when user already has agents */}
          {canRedeemAccessCode && (
            <RedeemAccessCodeForm
              title={redeemTitle}
              description={redeemDescription}
              className="border-border bg-card flex h-full flex-col rounded-lg border p-6"
            />
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="border-border flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16">
          <Mic className="text-muted-foreground mb-4 h-12 w-12" />
          {canCreate ? (
            <>
              <h3 className="text-foreground mb-2 text-lg font-medium">No Voice Agents Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first voice agent to get started
              </p>
              <Link
                to="/voice-exams/create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2"
              >
                <Plus className="h-4 w-4" />
                Create Agent
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-foreground mb-2 text-lg font-medium">No Exams Unlocked Yet</h3>
              <p className="text-muted-foreground mb-6 text-center">{DESCRIPTIONS.emptyPrompt}</p>
              <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
                {DESCRIPTIONS.setupUnavailable}
              </p>
              {canRedeemAccessCode && (
                <RedeemAccessCodeForm
                  title={redeemTitle}
                  description={redeemDescription}
                  className="w-full max-w-sm"
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceExamsList;
