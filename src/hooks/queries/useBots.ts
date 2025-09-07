import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useIsAuthenticated } from '@/hooks/queries/useUser';

import { botService } from '@/services/bots.service';

import {
  Bot,
  BotModelPreferenceRequest,
  BotPromptRequest,
  CreateBotRequest,
  UpdateBotRequest,
} from '@/types/bot';

import { botGroupKeys } from './useBotGroups';

export const botKeys = {
  all: ['bots'] as const,
  lists: () => [...botKeys.all, 'list'] as const,
  list: (botGroupId: number) => [...botKeys.lists(), botGroupId] as const,
  details: () => [...botKeys.all, 'detail'] as const,
  detail: (botGroupId: number, botId: number) => [...botKeys.details(), botGroupId, botId] as const,
};

/**
 * Get all bots for a specific bot group
 */
export const useBots = (botGroupId: number, enabled: boolean = true) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: botKeys.list(botGroupId),
    queryFn: () => botService.getBots(botGroupId),
    enabled: enabled && !!botGroupId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Get a single bot by ID
 */
export const useBot = (
  botGroupId: number,
  botId: number,
  enabled: boolean = true,
  refetchInterval?: number
) => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: botKeys.detail(botGroupId, botId),
    queryFn: () => botService.getBot(botGroupId, botId),
    enabled: enabled && !!botGroupId && !!botId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval,
  });
};

/**
 * Create a new bot
 */
export const useCreateBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      botGroupId,
      botData,
      modelPreferences,
      promptData,
    }: {
      botGroupId: number;
      botData: CreateBotRequest;
      modelPreferences?: BotModelPreferenceRequest;
      promptData?: BotPromptRequest;
    }) => {
      // Merge all data into a single request object
      const fullBotData = {
        ...botData,
        ...modelPreferences,
        ...promptData,
      };
      return botService.createBot(botGroupId, fullBotData);
    },
    onSuccess: (newBot: Bot, { botGroupId }) => {
      // Optimistically update the bots list
      queryClient.setQueryData<Bot[]>(botKeys.list(botGroupId), oldBots => {
        return oldBots ? [...oldBots, newBot] : [newBot];
      });

      // Update bot group's bots_count
      queryClient.invalidateQueries({ queryKey: botGroupKeys.detail(botGroupId) });
      queryClient.invalidateQueries({ queryKey: botGroupKeys.lists() });
    },
    onError: error => {
      console.error('Failed to create bot:', error);
    },
  });
};

/**
 * Update an existing bot
 */
export const useUpdateBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      botGroupId,
      botId,
      botData,
      modelPreferences,
      promptData,
    }: {
      botGroupId: number;
      botId: number;
      botData: UpdateBotRequest;
      modelPreferences?: BotModelPreferenceRequest;
      promptData?: BotPromptRequest;
    }) => {
      // Merge all data into a single request object
      const fullBotData = {
        ...botData,
        ...modelPreferences,
        ...promptData,
      };
      return botService.updateBot(botGroupId, botId, fullBotData);
    },
    onSuccess: (updatedBot: Bot, { botGroupId, botId }) => {
      // Update the specific bot detail
      queryClient.setQueryData<Bot>(botKeys.detail(botGroupId, botId), updatedBot);

      // Update the bot in the list
      queryClient.setQueryData<Bot[]>(botKeys.list(botGroupId), oldBots => {
        return oldBots ? oldBots.map(bot => (bot.id === botId ? updatedBot : bot)) : [updatedBot];
      });
    },
    onError: error => {
      console.error('Failed to update bot:', error);
    },
  });
};

/**
 * Delete a bot
 */
export const useDeleteBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ botGroupId, botId }: { botGroupId: number; botId: number }) =>
      botService.deleteBot(botGroupId, botId),
    onSuccess: (_, { botGroupId, botId }) => {
      // Remove from the bots list
      queryClient.setQueryData<Bot[]>(botKeys.list(botGroupId), oldBots => {
        return oldBots ? oldBots.filter(bot => bot.id !== botId) : [];
      });

      // Remove the detailed data
      queryClient.removeQueries({ queryKey: botKeys.detail(botGroupId, botId) });

      // Update bot group's bots_count
      queryClient.invalidateQueries({ queryKey: botGroupKeys.detail(botGroupId) });
      queryClient.invalidateQueries({ queryKey: botGroupKeys.lists() });
    },
    onError: error => {
      console.error('Failed to delete bot:', error);
    },
  });
};

/**
 * Attach files to a bot
 */
export const useAttachFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      botGroupId,
      botId,
      fileIds,
    }: {
      botGroupId: number;
      botId: number;
      fileIds: number[];
    }) => botService.attachFiles(botGroupId, botId, fileIds),
    onSuccess: (_, { botGroupId, botId }) => {
      // Refetch the bot to get updated file information
      queryClient.invalidateQueries({ queryKey: botKeys.detail(botGroupId, botId) });
      queryClient.invalidateQueries({ queryKey: botKeys.list(botGroupId) });
    },
    onError: error => {
      console.error('Failed to attach files:', error);
    },
  });
};

/**
 * Detach files from a bot
 */
export const useDetachFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      botGroupId,
      botId,
      fileIds,
    }: {
      botGroupId: number;
      botId: number;
      fileIds: number[];
    }) => botService.detachFiles(botGroupId, botId, fileIds),
    onSuccess: (_, { botGroupId, botId }) => {
      // Refetch the bot to get updated file information
      queryClient.invalidateQueries({ queryKey: botKeys.detail(botGroupId, botId) });
      queryClient.invalidateQueries({ queryKey: botKeys.list(botGroupId) });
    },
    onError: error => {
      console.error('Failed to detach files:', error);
    },
  });
};

/**
 * Clone a bot
 */
export const useCloneBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ botGroupId, botId }: { botGroupId: number; botId: number }) =>
      botService.cloneBot(botGroupId, botId),
    onSuccess: (clonedBot: Bot, { botGroupId }) => {
      // Append to list
      queryClient.setQueryData<Bot[]>(botKeys.list(botGroupId), oldBots => {
        return oldBots ? [...oldBots, clonedBot] : [clonedBot];
      });
      // Invalidate counts on group
      queryClient.invalidateQueries({ queryKey: botGroupKeys.detail(botGroupId) });
      queryClient.invalidateQueries({ queryKey: botGroupKeys.lists() });
    },
    onError: error => {
      console.error('Failed to clone bot:', error);
    },
  });
};
