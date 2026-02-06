/**
 * VoiceExams list page.
 * Shows all voice agents and allows creators to manage them.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Clock, Download, Mic, Plus, RefreshCw, User } from 'lucide-react';

import { useUser } from '@/hooks/queries/useUser';
import {
  useElevenLabsAgents,
  useImportElevenLabsAgent,
  useVoiceAgents,
} from '@/hooks/queries/useVoiceAgents';

const VoiceExamsList: React.FC = () => {
  const user = useUser();
  const { data: agents, isLoading, refetch } = useVoiceAgents();
  const {
    data: elevenlabsAgents,
    isLoading: loadingElevenlabs,
    refetch: refetchElevenlabs,
  } = useElevenLabsAgents(user?.isCreator ?? false);
  const importAgent = useImportElevenLabsAgent();

  const [showImportSection, setShowImportSection] = useState(false);

  const isCreator = user?.isCreator ?? false;

  const handleImport = async (agentId: string) => {
    await importAgent.mutateAsync(agentId);
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Exams</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isCreator
              ? 'Create and manage voice-based exams powered by ElevenLabs AI'
              : 'Take voice-based exams powered by ElevenLabs AI'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {isCreator && (
            <>
              <button
                onClick={() => setShowImportSection(!showImportSection)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Download className="h-4 w-4" />
                Import
              </button>
              <Link
                to="/voice-exams/create"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Agent
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Import Section (Creators only) */}
      {isCreator && showImportSection && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Import from ElevenLabs
            </h2>
            <button
              onClick={() => refetchElevenlabs()}
              disabled={loadingElevenlabs}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <RefreshCw className={`h-4 w-4 ${loadingElevenlabs ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingElevenlabs ? (
            <div className="flex h-24 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : elevenlabsAgents && elevenlabsAgents.length > 0 ? (
            <div className="grid gap-3">
              {elevenlabsAgents.map(agent => (
                <div
                  key={agent.agentId}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-600"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {importAgent.isPending ? 'Importing...' : 'Import'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No ElevenLabs agents found. Create one in the ElevenLabs dashboard or use the Create
              Agent button above.
            </p>
          )}
        </div>
      )}

      {/* Agents Grid */}
      {agents && agents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map(agent => (
            <Link
              key={agent.id}
              to={`/voice-exams/${agent.id}`}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    agent.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {agent.name}
              </h3>

              {agent.examTitle && (
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {agent.examTitle}
                </p>
              )}

              <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {agent.description || 'No description provided'}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 dark:border-gray-600">
          <Mic className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No Voice Agents Yet
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {isCreator
              ? 'Create your first voice agent to get started'
              : 'No voice exams are available yet'}
          </p>
          {isCreator && (
            <Link
              to="/voice-exams/create"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Agent
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceExamsList;
