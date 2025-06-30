import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LearningGoal, chapterService } from '@/services/chapters.service';
import { Chapter, chatService } from '@/services/chat.service';

import type { ChatMessage, Conversation } from '@/types/chat';

import { useBooks } from './useBooks';

// Query Keys
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  chapters: () => [...chatKeys.all, 'chapters'] as const,
  tracking: (conversationId: string) => [...chatKeys.all, 'tracking', conversationId] as const,
};

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
          const chapters = await chapterService.getChapters(book.id);
          chapters.forEach(chapter => {
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

// Get available chapters for chat
export const useChatChapters = () =>
  useQuery({
    queryKey: chatKeys.chapters(),
    queryFn: chatService.getAvailableChapters,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

// Get conversation for a chapter
export const useConversationForChapter = (chapterId: string | null) =>
  useQuery({
    queryKey: ['chat', 'conversation', 'chapter', chapterId],
    queryFn: () => chatService.getConversationForChapter(chapterId!),
    enabled: !!chapterId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
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

// Send a message to a conversation
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      chatService.sendMessage(conversationId, message),
    onSuccess: (newMessage, { conversationId }) => {
      // Update the conversation cache with the new message
      queryClient.setQueryData<Conversation>(
        ['chat', 'conversation', 'chapter', conversationId],
        old => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, newMessage],
          };
        }
      );
    },
  });
};

// Clear conversation
export const useClearConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.clearConversation(conversationId),
    onSuccess: (updatedConversation, conversationId) => {
      // Update all related queries
      queryClient.setQueryData<Conversation>(
        ['chat', 'conversation', 'chapter', conversationId],
        updatedConversation
      );

      // Find all conversation queries that match this conversation ID and update them
      queryClient.invalidateQueries({
        predicate: query => {
          const queryKey = query.queryKey;
          return (
            queryKey.includes('chat') &&
            queryKey.includes('conversation') &&
            queryKey.includes(conversationId)
          );
        },
      });

      // Clear any cached chapters that might reference this conversation
      queryClient
        .getQueryCache()
        .getAll()
        .forEach(query => {
          if (query.queryKey.includes('chapters')) {
            const chapters = query.state.data as Chapter[] | undefined;
            if (chapters?.some(chapter => chapter.id === conversationId)) {
              queryClient.invalidateQueries({ queryKey: query.queryKey });
            }
          }
        });

      // Clear any tracking progress for this conversation
      queryClient.removeQueries({ queryKey: ['chat', 'trackingProgress', conversationId] });
    },
  });
};

// Get latest progress for a conversation
export const useTrackingProgress = (conversationId: string | null) =>
  useQuery({
    queryKey: ['chat', 'trackingProgress', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      try {
        return await chatService.getLatestProgress(conversationId);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number } };
          if (axiosError.response?.status === 404) {
            // No progress yet for this conversation
            return null;
          }
        }
        throw error;
      }
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  });

// Stream message hook with proper typing
export const useStreamMessage = () => {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tokens, setTokens] = useState<string[]>([]);

  const streamMessage = async ({
    conversationId,
    content,
  }: {
    conversationId: string;
    content: string;
  }) => {
    setIsStreaming(true);
    setError(null);
    setTokens([]);

    try {
      const fullResponse = await chatService.streamMessage(conversationId, content, {
        onStart: () => setIsStreaming(true),
        onToken: (token: string) => {
          setTokens(prev => [...prev, token]);
        },
        onComplete: async (completeMessage?: ChatMessage) => {
          setIsStreaming(false);

          // Update the conversation with the complete message from server
          if (completeMessage) {
            queryClient.setQueryData<Conversation>(
              ['chat', 'conversation', 'chapter', conversationId],
              (oldData: Conversation | undefined) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  messages: [...oldData.messages, completeMessage],
                };
              }
            );
          } else {
            // Fallback: invalidate queries to refetch
            queryClient.invalidateQueries({
              queryKey: ['chat', 'conversation', 'chapter', conversationId],
            });
          }

          // Trigger progress tracking after message completion with Zustand store callbacks
          try {
            // Import the store dynamically to avoid circular dependencies
            const { useChatStore } = await import('@/stores/chatStore');
            const store = useChatStore.getState();

            await chatService.triggerProgressTracking(conversationId, {
              onStart: () => {
                store.setProgressStreaming(true);
                store.clearProgressTokens();
              },
              onToken: token => {
                store.addProgressToken(token);
              },
              onComplete: () => {
                store.setProgressStreaming(false);
                // Invalidate progress after tracking completes
                queryClient.invalidateQueries({ queryKey: ['chat', 'trackingProgress'] });
              },
              onError: (error: Error) => {
                store.setProgressStreaming(false);
                console.error('Progress tracking error:', error);
              },
            });
          } catch (progressError) {
            console.error('Error triggering progress tracking:', progressError);
          }
        },
        onError: (err: Error) => {
          setError(err);
          setIsStreaming(false);
        },
      });
      setIsStreaming(false);
      return fullResponse;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsStreaming(false);
      throw err;
    }
  };

  return { streamMessage, isStreaming, error, tokens };
};

// Stream progress tracking for real-time assessment
export const useStreamProgressTracking = () => {
  const queryClient = useQueryClient();

  const streamProgressTracking = async (conversationId: string) => {
    try {
      // Import the store dynamically to avoid circular dependencies
      const { useChatStore } = await import('@/stores/chatStore');
      const store = useChatStore.getState();

      await chatService.streamTrackingProgress(conversationId, {
        onStart: () => {
          store.setProgressStreaming(true);
          store.clearProgressTokens();
          console.log('[ProgressStream] Started');
        },
        onToken: token => {
          store.addProgressToken(token);
          console.log('[ProgressStream] Token:', token);
        },
        onComplete: () => {
          store.setProgressStreaming(false);
          // Invalidate the progress query to refetch the final result
          queryClient.invalidateQueries({ queryKey: ['chat', 'trackingProgress'] });
          console.log('[ProgressStream] Completed');
        },
        onError: (err: Error) => {
          store.setProgressStreaming(false);
          console.error('[ProgressStream] Error:', err);
        },
      });
    } catch (err) {
      console.error('Error in streamProgressTracking:', err);
      // Ensure streaming state is reset on error
      const { useChatStore } = await import('@/stores/chatStore');
      const store = useChatStore.getState();
      store.setProgressStreaming(false);
    }
  };

  return { streamProgressTracking };
};
