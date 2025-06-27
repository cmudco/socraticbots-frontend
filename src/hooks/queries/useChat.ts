import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import type { Conversation, ChatMessage, SendMessagePayload } from '@/types/chat';
import { useState } from 'react';

// Fetch conversation for a chapter (single active conversation per chapter)
export const useConversationForChapter = (chapterId: string | null) =>
  useQuery<Conversation | undefined>({
    queryKey: ['chat', 'conversation', chapterId],
    queryFn: () => (chapterId ? chatService.getConversationForChapter(chapterId) : undefined),
    enabled: !!chapterId,
    staleTime: 5 * 60 * 1000,
  });

// Fetch messages for a conversation (from conversation object)
export const useChatMessages = (chapterId: string | null) => {
  const { data: conversation, ...rest } = useConversationForChapter(chapterId);
  return {
    messages: conversation?.messages ?? [],
    ...rest,
  };
};

// Send a message in a conversation
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, content }: SendMessagePayload) => {
      return chatService.sendMessage(conversationId, content);
    },
    onSuccess: (_data, variables) => {
      // Invalidate the conversation query to refetch messages
      queryClient.invalidateQueries(['chat', 'conversation', variables.conversationId]);
    },
  });
};

// Clear a conversation
export const useClearConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => chatService.clearConversation(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries(['chat', 'conversation', conversationId]);
    },
  });
};

export const useTrackingProgress = (conversationId: string | null) =>
  useQuery({
    queryKey: ['chat', 'trackingProgress', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      try {
        return await chatService.getLatestProgress(conversationId);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          // No progress yet for this conversation
          return null;
        }
        throw error;
      }
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });

// Stream a message in a conversation (for real-time AI streaming)
export const useStreamMessage = () => {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tokens, setTokens] = useState<string[]>([]);

  const streamMessage = async ({ conversationId, content }: SendMessagePayload) => {
    setIsStreaming(true);
    setError(null);
    setTokens([]);
    let fullResponse = '';
    try {
      await chatService.streamMessage(conversationId, content, {
        onStart: () => setTokens([]),
        onToken: (token) => {
          setTokens((prev) => [...prev, token]);
          fullResponse += token;
        },
        onComplete: () => {
          setIsStreaming(false);
          // Invalidate the conversation query to refetch messages
          queryClient.invalidateQueries(['chat', 'conversation', conversationId]);
        },
        onError: (err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsStreaming(false);
        },
      });
      setIsStreaming(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsStreaming(false);
    }
    return fullResponse;
  };

  return { streamMessage, isStreaming, error, tokens };
};