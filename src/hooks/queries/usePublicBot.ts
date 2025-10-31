import { METHOD } from '@/constants/requests';
import { useMutation, useQuery } from '@tanstack/react-query';

import { baseRequest } from '@/utils/baseRequest';

import type { PublicBotConversation, PublicBotInfo } from '@/types/publicBot';

export const publicBotKeys = {
  all: ['publicBot'] as const,
  info: (botId: string) => [...publicBotKeys.all, 'info', botId] as const,
  conversation: (botId: string, sessionId: string) =>
    [...publicBotKeys.all, 'conversation', botId, sessionId] as const,
};

// Fetch public bot info
const fetchPublicBotInfo = async (botId: string): Promise<PublicBotInfo> => {
  return baseRequest<PublicBotInfo>({
    url: `conversations/public/bots/${botId}/info/`,
    method: METHOD.GET,
    includeAuthToken: false,
  });
};

// Get or create public bot conversation
const getOrCreateConversation = async ({
  botId,
  sessionId,
}: {
  botId: string;
  sessionId: string;
}): Promise<PublicBotConversation> => {
  return baseRequest<PublicBotConversation>({
    url: `conversations/public/bots/${botId}/conversations/`,
    method: METHOD.POST,
    data: {
      sessionId: sessionId,
    },
    includeAuthToken: false,
  });
};

// Hook to fetch public bot info
export const usePublicBotInfo = (botId: string | undefined) =>
  useQuery({
    queryKey: publicBotKeys.info(botId || ''),
    queryFn: () => fetchPublicBotInfo(botId!),
    enabled: !!botId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

// Hook to get or create conversation
export const useGetOrCreateConversation = () =>
  useMutation({
    mutationFn: getOrCreateConversation,
  });
