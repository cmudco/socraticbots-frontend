import { useQuery } from '@tanstack/react-query';

// Clean hooks file - only what we need for WebSocket-based architecture
import { conversationService } from '@/services/conversation.service';

export const chatKeys = {
  all: ['chat'] as const,
  bots: () => [...chatKeys.all, 'bots'] as const,
};

// Only hook we need - get available bots for bot selector
export const useChatBots = () =>
  useQuery({
    queryKey: [...chatKeys.all, 'bots'],
    queryFn: conversationService.getAvailableBots,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

// All other functionality (messages, progress, streaming) is now handled via WebSocket
// in conversationStore and chatStore
