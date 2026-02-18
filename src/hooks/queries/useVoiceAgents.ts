/**
 * TanStack Query hooks for Voice Agents.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useIsAuthenticated } from '@/hooks/queries/useUser';

import { voiceAgentService } from '@/services/voiceAgent.service';

import {
  VoiceAgent,
  VoiceAgentCreateData,
  VoiceAgentListItem,
  VoiceAgentUpdateData,
} from '@/types/voiceAgent';

export const voiceAgentKeys = {
  all: ['voiceAgents'] as const,
  lists: () => [...voiceAgentKeys.all, 'list'] as const,
  list: () => [...voiceAgentKeys.lists()] as const,
  details: () => [...voiceAgentKeys.all, 'detail'] as const,
  detail: (id: number) => [...voiceAgentKeys.details(), id] as const,
  elevenlabsAgents: () => [...voiceAgentKeys.all, 'elevenlabs'] as const,
  conversations: () => [...voiceAgentKeys.all, 'conversations'] as const,
  conversation: (id: number) => [...voiceAgentKeys.conversations(), id] as const,
};

/**
 * Get all voice agents
 */
export const useVoiceAgents = (enabled: boolean = true) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: voiceAgentKeys.list(),
    queryFn: () => voiceAgentService.getVoiceAgents(),
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Get a single voice agent by ID
 */
export const useVoiceAgent = (id: number, enabled: boolean = true) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: voiceAgentKeys.detail(id),
    queryFn: () => voiceAgentService.getVoiceAgentById(id),
    enabled: enabled && !!id && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Create a new voice agent
 */
export const useCreateVoiceAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoiceAgentCreateData) => voiceAgentService.createVoiceAgent(data),
    onSuccess: (newAgent: VoiceAgent) => {
      // Optimistically update the agents list
      queryClient.setQueryData<VoiceAgentListItem[]>(voiceAgentKeys.list(), oldAgents => {
        const listItem: VoiceAgentListItem = {
          id: newAgent.id,
          user: newAgent.user,
          userEmail: newAgent.userEmail,
          name: newAgent.name,
          description: newAgent.description,
          status: newAgent.status,
          examTitle: newAgent.examTitle,
          createdAt: newAgent.createdAt,
        };
        return oldAgents ? [listItem, ...oldAgents] : [listItem];
      });
    },
    onError: error => {
      console.error('Failed to create voice agent:', error);
    },
  });
};

/**
 * Update an existing voice agent
 */
export const useUpdateVoiceAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VoiceAgentUpdateData }) =>
      voiceAgentService.updateVoiceAgent(id, data),
    onSuccess: (updatedAgent: VoiceAgent, { id }) => {
      // Update the specific agent detail
      queryClient.setQueryData<VoiceAgent>(voiceAgentKeys.detail(id), updatedAgent);

      // Update the agent in the list
      queryClient.setQueryData<VoiceAgentListItem[]>(voiceAgentKeys.list(), oldAgents => {
        const listItem: VoiceAgentListItem = {
          id: updatedAgent.id,
          user: updatedAgent.user,
          userEmail: updatedAgent.userEmail,
          name: updatedAgent.name,
          description: updatedAgent.description,
          status: updatedAgent.status,
          examTitle: updatedAgent.examTitle,
          createdAt: updatedAgent.createdAt,
        };
        return oldAgents
          ? oldAgents.map(agent => (agent.id === id ? listItem : agent))
          : [listItem];
      });
    },
    onError: error => {
      console.error('Failed to update voice agent:', error);
    },
  });
};

/**
 * Delete a voice agent
 */
export const useDeleteVoiceAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => voiceAgentService.deleteVoiceAgent(id),
    onSuccess: (_, id) => {
      // Remove from the agents list
      queryClient.setQueryData<VoiceAgentListItem[]>(voiceAgentKeys.list(), oldAgents => {
        return oldAgents ? oldAgents.filter(agent => agent.id !== id) : [];
      });

      // Remove the detailed data
      queryClient.removeQueries({ queryKey: voiceAgentKeys.detail(id) });
    },
    onError: error => {
      console.error('Failed to delete voice agent:', error);
    },
  });
};

/**
 * Get signed URL for voice conversation
 */
export const useGetSignedUrl = () => {
  return useMutation({
    mutationFn: (agentId: number) => voiceAgentService.getSignedUrl(agentId),
    onError: error => {
      console.error('Failed to get signed URL:', error);
    },
  });
};

/**
 * Start a voice conversation
 */
export const useStartConversation = () => {
  return useMutation({
    mutationFn: ({ agentId, conversationId }: { agentId: number; conversationId: string }) =>
      voiceAgentService.startConversation(agentId, conversationId),
    onError: error => {
      console.error('Failed to start conversation:', error);
    },
  });
};

/**
 * End a voice conversation
 */
export const useEndConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, conversationId }: { agentId: number; conversationId: string }) =>
      voiceAgentService.endConversation(agentId, conversationId),
    onSuccess: (_, { agentId }) => {
      // Invalidate agent detail to refresh conversation count
      queryClient.invalidateQueries({ queryKey: voiceAgentKeys.detail(agentId) });
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: voiceAgentKeys.conversations() });
    },
    onError: error => {
      console.error('Failed to end conversation:', error);
    },
  });
};

/**
 * Get ElevenLabs agents (for import)
 */
export const useElevenLabsAgents = (enabled: boolean = true) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: voiceAgentKeys.elevenlabsAgents(),
    queryFn: () => voiceAgentService.getElevenLabsAgents(),
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Import an ElevenLabs agent
 */
export const useImportElevenLabsAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => voiceAgentService.importElevenLabsAgent(agentId),
    onSuccess: (importedAgent: VoiceAgent) => {
      // Add to local agents list
      queryClient.setQueryData<VoiceAgentListItem[]>(voiceAgentKeys.list(), oldAgents => {
        const listItem: VoiceAgentListItem = {
          id: importedAgent.id,
          user: importedAgent.user,
          userEmail: importedAgent.userEmail,
          name: importedAgent.name,
          description: importedAgent.description,
          status: importedAgent.status,
          examTitle: importedAgent.examTitle,
          createdAt: importedAgent.createdAt,
        };
        return oldAgents ? [listItem, ...oldAgents] : [listItem];
      });

      // Invalidate ElevenLabs agents to refresh sync status
      queryClient.invalidateQueries({ queryKey: voiceAgentKeys.elevenlabsAgents() });
    },
    onError: error => {
      console.error('Failed to import agent:', error);
    },
  });
};
