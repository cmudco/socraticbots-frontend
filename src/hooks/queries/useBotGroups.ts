import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { 
  CreateBotGroupRequest, 
  UpdateBotGroupRequest, 
  AddCollaboratorRequest,
  botGroupService 
} from '@/services/botGroups.service';

import { BotGroup, BotGroupDetail } from '@/types/botGroup';

export const botGroupKeys = {
  all: ['botGroups'] as const,
  lists: () => [...botGroupKeys.all, 'list'] as const,
  list: (filters?: string) => [...botGroupKeys.lists(), { filters }] as const,
  details: () => [...botGroupKeys.all, 'detail'] as const,
  detail: (id: number) => [...botGroupKeys.details(), id] as const,
  search: (query: string) => [...botGroupKeys.all, 'search', query] as const,
};

/**
 * Get all bot groups for the current user
 */
export const useBotGroups = () => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: botGroupKeys.lists(),
    queryFn: () => botGroupService.getBotGroups(),
    enabled: isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Get a single bot group by ID with detailed information
 */
export const useBotGroup = (id: number, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: botGroupKeys.detail(id),
    queryFn: () => botGroupService.getBotGroup(id),
    enabled: enabled && !!id && isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Search bot groups by query
 */
export const useSearchBotGroups = (query: string, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: botGroupKeys.search(query),
    queryFn: () => botGroupService.searchBotGroups(query),
    enabled: enabled && !!query.trim() && isAuthenticated && !!tokens?.access,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new bot group
 */
export const useCreateBotGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (botGroupData: CreateBotGroupRequest) => 
      botGroupService.createBotGroup(botGroupData),
    onSuccess: (newBotGroup: BotGroup) => {
      // Optimistically update the list
      queryClient.setQueryData<BotGroup[]>(botGroupKeys.lists(), oldBotGroups => {
        return oldBotGroups ? [...oldBotGroups, newBotGroup] : [newBotGroup];
      });

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: botGroupKeys.all });
    },
    onError: error => {
      console.error('Failed to create bot group:', error);
    },
  });
};

/**
 * Update an existing bot group
 */
export const useUpdateBotGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, botGroupData }: { id: number; botGroupData: UpdateBotGroupRequest }) =>
      botGroupService.updateBotGroup(id, botGroupData),
    onSuccess: (updatedBotGroup: BotGroup) => {
      // Update the specific bot group detail
      queryClient.setQueryData<BotGroupDetail>(
        botGroupKeys.detail(updatedBotGroup.id), 
        oldData => oldData ? { ...oldData, ...updatedBotGroup } : undefined
      );

      // Update the bot group in the list
      queryClient.setQueryData<BotGroup[]>(botGroupKeys.lists(), oldBotGroups => {
        return oldBotGroups
          ? oldBotGroups.map(group => (group.id === updatedBotGroup.id ? updatedBotGroup : group))
          : [updatedBotGroup];
      });

      // Invalidate search queries
      queryClient.invalidateQueries({ queryKey: botGroupKeys.search('') });
    },
    onError: error => {
      console.error('Failed to update bot group:', error);
    },
  });
};

/**
 * Delete a bot group
 */
export const useDeleteBotGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => botGroupService.deleteBotGroup(id),
    onSuccess: (_, deletedId: number) => {
      // Remove from the list
      queryClient.setQueryData<BotGroup[]>(botGroupKeys.lists(), oldBotGroups => {
        return oldBotGroups ? oldBotGroups.filter(group => group.id !== deletedId) : [];
      });

      // Remove the detailed data
      queryClient.removeQueries({ queryKey: botGroupKeys.detail(deletedId) });

      // Invalidate search queries
      queryClient.invalidateQueries({ queryKey: botGroupKeys.search('') });
    },
    onError: error => {
      console.error('Failed to delete bot group:', error);
    },
  });
};

/**
 * Add collaborator to bot group
 */
export const useAddCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, collaboratorData }: { id: number; collaboratorData: AddCollaboratorRequest }) =>
      botGroupService.addCollaborator(id, collaboratorData),
    onSuccess: (_, { id }) => {
      // Refetch the bot group details to get updated collaborators
      queryClient.invalidateQueries({ queryKey: botGroupKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: botGroupKeys.lists() });
    },
    onError: error => {
      console.error('Failed to add collaborator:', error);
    },
  });
};

/**
 * Remove collaborator from bot group
 */
export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, collaboratorData }: { id: number; collaboratorData: AddCollaboratorRequest }) =>
      botGroupService.removeCollaborator(id, collaboratorData),
    onSuccess: (_, { id }) => {
      // Refetch the bot group details to get updated collaborators
      queryClient.invalidateQueries({ queryKey: botGroupKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: botGroupKeys.lists() });
    },
    onError: error => {
      console.error('Failed to remove collaborator:', error);
    },
  });
};