/**
 * VoiceExams list page.
 * Shows all voice agents the user can access via any role.
 * Admins/managers can create new agents, import from ElevenLabs, and manage.
 * Students see an access code input to unlock exams.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Clock, Download, Mic, Plus, RefreshCw, Shield, User, Users } from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';
import {
  useElevenLabsAgents,
  useImportElevenLabsAgent,
  useRedeemVoiceAccessCode,
  useVoiceAgents,
} from '@/hooks/queries/useVoiceAgents';

import { ROLE_BADGE_STYLES } from '@/utils/voiceAgentStyles';

import { AgentStatus } from '@/types/voiceAgent';

const VoiceExamsList: React.FC = () => {
  const user = useUser();
  const { data: agents, isLoading } = useVoiceAgents();

  const canCreate = user?.hasSupervisorAccessForVoiceAgent || user?.isVoiceTeamManager || false;

  // Hide draft exams from students — only creators/managers see drafts
  const visibleAgents = canCreate
    ? agents
    : agents?.filter(agent => agent.status === AgentStatus.Active);

  const {
    data: elevenlabsAgents,
    isLoading: loadingElevenlabs,
    refetch: refetchElevenlabs,
  } = useElevenLabsAgents(canCreate);
  const importAgent = useImportElevenLabsAgent();
  const redeemCode = useRedeemVoiceAccessCode();

  const [showImportSection, setShowImportSection] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [redeemError, setRedeemError] = useState('');

  const handleImport = async (agentId: string) => {
    await importAgent.mutateAsync(agentId);
  };

  const handleRedeemCode = async () => {
    if (!accessCode.trim()) return;
    setRedeemError('');
    try {
      await redeemCode.mutateAsync(accessCode.trim());
      setAccessCode('');
    } catch {
      setRedeemError('Invalid access code. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
            {canCreate
              ? 'Create and manage voice-based exams powered by ElevenLabs AI'
              : 'Take voice-based exams powered by ElevenLabs AI'}
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
      {canCreate && showImportSection && (
        <div className="border-border bg-card mb-8 rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">Import from ElevenLabs</h2>
            <button
              onClick={() => refetchElevenlabs()}
              disabled={loadingElevenlabs}
              className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loadingElevenlabs ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingElevenlabs ? (
            <div className="flex h-24 items-center justify-center">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : elevenlabsAgents && elevenlabsAgents.length > 0 ? (
            <div className="grid gap-3">
              {elevenlabsAgents.map(agent => (
                <div
                  key={agent.agentId}
                  className="border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="text-foreground font-medium">{agent.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      ID: {agent.agentId.substring(0, 16)}...
                    </p>
                  </div>
                  {agent.isSynced ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Imported
                    </span>
                  ) : (
                    <button
                      onClick={() => handleImport(agent.agentId)}
                      disabled={importAgent.isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm disabled:opacity-50"
                    >
                      {importAgent.isPending ? 'Importing...' : 'Import'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">
              No ElevenLabs agents found. Create one in the ElevenLabs dashboard or use the Create
              Agent button above.
            </p>
          )}
        </div>
      )}

      {/* Agents Grid */}
      {visibleAgents && visibleAgents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleAgents.map(agent => (
            <Link
              key={agent.id}
              to={`/voice-exams/${agent.id}`}
              className="border-border bg-card group rounded-lg border p-6 transition-shadow hover:shadow-lg"
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
                  {formatDate(agent.createdAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
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
              <h3 className="text-foreground mb-2 text-lg font-medium">Enter Your Exam Code</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Enter the access code provided by your instructor to unlock your exam.
              </p>
              <div className="flex w-full max-w-sm flex-col gap-3">
                <input
                  type="text"
                  value={accessCode}
                  onChange={e => {
                    setAccessCode(e.target.value);
                    setRedeemError('');
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleRedeemCode()}
                  placeholder="Enter access code"
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {redeemError && <p className="text-center text-sm text-red-500">{redeemError}</p>}
                <button
                  onClick={handleRedeemCode}
                  disabled={redeemCode.isPending || !accessCode.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 disabled:opacity-50"
                >
                  {redeemCode.isPending ? 'Unlocking...' : 'Unlock Exam'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceExamsList;
