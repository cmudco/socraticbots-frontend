import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, Chapter } from '@/services/chat.service';
import { chapterService, LearningGoal } from '@/services/chapters.service';
import { useBooks } from './useBooks';
import { api } from '@/services/api/instance';
import type { Conversation, SendMessagePayload } from '@/types/chat';
import { useState } from 'react';

// Create a mapping of chapter ID to book ID
export const useChapterToBookMapping = () => {
  const { data: books } = useBooks();

  return useQuery<Record<string, string>>({
    queryKey: ['chat', 'chapterToBookMapping'],
    queryFn: async () => {
      if (!books) return {};

      const mapping: Record<string, string> = {};

      // Get chapters for each book and build the mapping
      for (const book of books) {
        try {
          const response = await api.get(`/books/${book.id}/chapters/`);
          const chapters = response.data;
          chapters.forEach((chapter: any) => {
            mapping[chapter.id] = book.id;
          });
        } catch (error) {
          console.warn(`Error fetching chapters for book ${book.id}:`, error);
        }
      }

      return mapping;
    },
    enabled: !!books && books.length > 0,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

// Fetch available chapters
export const useAvailableChapters = () =>
  useQuery<Chapter[]>({
    queryKey: ['chat', 'availableChapters'],
    queryFn: () => chatService.getAvailableChapters(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

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

// Fetch structured learning goals for a chapter (requires book ID)
export const useChapterLearningGoals = (bookId: string | null, chapterId: string | null) =>
  useQuery<LearningGoal[]>({
    queryKey: ['chat', 'learningGoals', bookId, chapterId],
    queryFn: () => {
      if (!bookId || !chapterId) return [];
      return chapterService.getLearningGoals(bookId, chapterId);
    },
    enabled: !!bookId && !!chapterId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });



// Send a message in a conversation
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, content }: SendMessagePayload) => {
      return chatService.sendMessage(conversationId, content);
    },
    onSuccess: (_data, variables) => {
      // Invalidate the conversation query to refetch messages
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', variables.conversationId] });
      // Also invalidate tracking progress since new messages affect progress
      queryClient.invalidateQueries({ queryKey: ['chat', 'trackingProgress', variables.conversationId] });
    },
  });
};

// Clear a conversation
export const useClearConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => chatService.clearConversation(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'trackingProgress', conversationId] });
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
          queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', conversationId] });
          // Also invalidate tracking progress since new messages affect progress
          queryClient.invalidateQueries({ queryKey: ['chat', 'trackingProgress', conversationId] });
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