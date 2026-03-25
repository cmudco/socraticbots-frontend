/**
 * TanStack Query hooks for Voice Agents.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useIsAuthenticated } from '@/hooks/queries/useUser';

import { voiceAgentService } from '@/services/voiceAgent.service';

import {
  AgentMembersResponse,
  StudentAttemptInfo,
  VoiceAgent,
  VoiceAgentCreateData,
  VoiceAgentListItem,
  VoiceAgentUpdateData,
} from '@/types/voiceAgent';

/** Map a full VoiceAgent to the slim list representation. */
const toListItem = (agent: VoiceAgent): VoiceAgentListItem => ({
  id: agent.id,
  user: agent.user,
  userEmail: agent.userEmail,
  name: agent.name,
  description: agent.description,
  team: agent.team,
  teamName: agent.teamName,
  status: agent.status,
  examTitle: agent.examTitle,
  accessLevel: agent.permissions.accessLevel,
  createdAt: agent.createdAt,
});

export const voiceAgentKeys = {
  all: ['voiceAgents'] as const,
  lists: () => [...voiceAgentKeys.all, 'list'] as const,
  list: () => [...voiceAgentKeys.lists()] as const,
  details: () => [...voiceAgentKeys.all, 'detail'] as const,
  detail: (id: number) => [...voiceAgentKeys.details(), id] as const,
  elevenlabsAgents: () => [...voiceAgentKeys.all, 'elevenlabs'] as const,
  myTeams: () => [...voiceAgentKeys.all, 'myTeams'] as const,
  conversations: () => [...voiceAgentKeys.all, 'conversations'] as const,
  conversation: (id: number) => [...voiceAgentKeys.conversations(), id] as const,
  students: (agentId: number) => [...voiceAgentKeys.all, 'students', agentId] as const,
  members: (agentId: number) => [...voiceAgentKeys.all, 'members', agentId] as const,
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
 * Get teams the current user manages (or all teams for supervisors)
 */
export const useMyTeams = (enabled: boolean = true) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: voiceAgentKeys.myTeams(),
    queryFn: () => voiceAgentService.getMyTeams(),
    enabled: enabled && isAuthenticated,
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
      queryClient.setQueryData<VoiceAgentListItem[]>(voiceAgentKeys.list(), oldAgents => {
        const listItem = toListItem(newAgent);
        return oldAgents ? [listItem, ...oldAgents] : [listItem];
      });
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
      queryClient.setQueryData<VoiceAgent>(voiceAgentKeys.detail(id), updatedAgent);
      queryClient.setQueryData<VoiceAgentListItem[]>(voiceAgentKeys.list(), oldAgents => {
        const listItem = toListItem(updatedAgent);
        return oldAgents
          ? oldAgents.map(agent => (agent.id === id ? listItem : agent))
          : [listItem];
      });
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
  });
};

/**
 * Get signed URL for voice conversation
 */
export const useGetSignedUrl = () => {
  return useMutation({
    mutationFn: (agentId: number) => voiceAgentService.getSignedUrl(agentId),
  });
};

/**
 * Start a voice conversation
 */
export const useStartConversation = () => {
  return useMutation({
    mutationFn: ({ agentId, conversationId }: { agentId: number; conversationId: string }) =>
      voiceAgentService.startConversation(agentId, conversationId),
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
 * Redeem an access code to unlock a voice agent
 */
export const useRedeemVoiceAccessCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accessCode: string) => voiceAgentService.redeemAccessCode(accessCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceAgentKeys.list() });
    },
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
      queryClient.setQueryData<VoiceAgentListItem[]>(voiceAgentKeys.list(), oldAgents => {
        const listItem = toListItem(importedAgent);
        return oldAgents ? [listItem, ...oldAgents] : [listItem];
      });
      queryClient.invalidateQueries({ queryKey: voiceAgentKeys.elevenlabsAgents() });
    },
  });
};

/**
 * Sync a voice agent's config from ElevenLabs
 */
export const useSyncFromElevenLabs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => voiceAgentService.syncFromElevenLabs(id),
    onSuccess: (updatedAgent: VoiceAgent, id) => {
      queryClient.setQueryData<VoiceAgent>(voiceAgentKeys.detail(id), updatedAgent);
      queryClient.setQueryData<VoiceAgentListItem[]>(voiceAgentKeys.list(), oldAgents => {
        const listItem = toListItem(updatedAgent);
        return oldAgents
          ? oldAgents.map(agent => (agent.id === id ? listItem : agent))
          : [listItem];
      });
    },
  });
};

/**
 * Get students with attempt info for an agent
 */
export const useStudentAttempts = (agentId: number) => {
  return useQuery<StudentAttemptInfo[]>({
    queryKey: voiceAgentKeys.students(agentId),
    queryFn: () => voiceAgentService.getStudentAttempts(agentId),
    enabled: agentId > 0,
    staleTime: 30 * 1000,
  });
};

/**
 * Grant a student additional exam attempts
 */
export const useGrantRetake = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      agentId,
      email,
      maxAttempts,
    }: {
      agentId: number;
      email: string;
      maxAttempts: number;
    }) => voiceAgentService.grantRetake(agentId, email, maxAttempts),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: voiceAgentKeys.students(agentId) });
    },
  });
};

/**
 * Get members (team + agent-level) for an agent
 */
export const useAgentMembers = (agentId: number, enabled: boolean = true) => {
  return useQuery<AgentMembersResponse>({
    queryKey: voiceAgentKeys.members(agentId),
    queryFn: () => voiceAgentService.getAgentMembers(agentId),
    enabled: enabled && agentId > 0,
    staleTime: 60 * 1000,
  });
};

/**
 * Add a member to an agent's team
 */
export const useAddAgentMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      agentId,
      email,
      role,
      scope,
    }: {
      agentId: number;
      email: string;
      role: string;
      scope: 'team' | 'agent';
    }) => voiceAgentService.addAgentMember(agentId, email, role, scope),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: voiceAgentKeys.members(agentId) });
    },
  });
};

/**
 * Remove a member from an agent's team
 */
export const useRemoveAgentMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      agentId,
      membershipId,
      scope,
    }: {
      agentId: number;
      membershipId: number;
      scope: 'team' | 'agent';
    }) => voiceAgentService.removeAgentMember(agentId, membershipId, scope),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: voiceAgentKeys.members(agentId) });
    },
  });
};
