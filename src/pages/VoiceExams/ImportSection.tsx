/**
 * ElevenLabs agent import panel for voice admins.
 */
import React from 'react';

import { RefreshCw } from 'lucide-react';

import { useElevenLabsAgents, useImportElevenLabsAgent } from '@/hooks/queries/useVoiceAgents';

interface ImportSectionProps {
  canCreate: boolean;
}

const ImportSection: React.FC<ImportSectionProps> = ({ canCreate }) => {
  const {
    data: elevenlabsAgents,
    isLoading: loadingElevenlabs,
    refetch: refetchElevenlabs,
  } = useElevenLabsAgents(canCreate);
  const importAgent = useImportElevenLabsAgent();

  const handleImport = async (agentId: string) => {
    await importAgent.mutateAsync(agentId);
  };

  return (
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
          No ElevenLabs agents found. Create one in the ElevenLabs dashboard or use the Create Agent
          button above.
        </p>
      )}
    </div>
  );
};

export default ImportSection;
