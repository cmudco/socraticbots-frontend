import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LearningGoal, chapterService } from '@/services/chapters.service';
import { Chapter, chatService } from '@/services/chat.service';

import { ChatRole } from '@/types/chat';
import type { ChatMessage, Conversation } from '@/types/chat';

import { useBooks } from './useBooks';

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  chapters: () => [...chatKeys.all, 'chapters'] as const,
  tracking: (conversationId: string) => [...chatKeys.all, 'tracking', conversationId] as const,
};

export const useChapterToBookMapping = () => {
  const { data: books } = useBooks();

  return useQuery<Record<string, string>>({
    queryKey: ['chat', 'chapterToBookMapping'],
    queryFn: async () => {
      if (!books) return {};

      const mapping: Record<string, string> = {};

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
    staleTime: 10 * 60 * 1000,
  });
};

export const useChatChapters = () =>
  useQuery({
    queryKey: chatKeys.chapters(),
    queryFn: chatService.getAvailableChapters,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const useConversationForChapter = (chapterId: string | null) =>
  useQuery({
    queryKey: ['chat', 'conversation', 'chapter', chapterId],
    queryFn: () => chatService.getConversationForChapter(chapterId!),
    enabled: !!chapterId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

export const useChatMessages = (chapterId: string | null) => {
  const { data: conversation, ...rest } = useConversationForChapter(chapterId);
  return {
    messages: conversation?.messages ?? [],
    ...rest,
  };
};

export const useChapterLearningGoals = (bookId: string | null, chapterId: string | null) =>
  useQuery<LearningGoal[]>({
    queryKey: ['chat', 'learningGoals', bookId, chapterId],
    queryFn: () => {
      if (!bookId || !chapterId) return [];
      return chapterService.getLearningGoals(bookId, chapterId);
    },
    enabled: !!bookId && !!chapterId,
    staleTime: 10 * 60 * 1000,
  });

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      chatService.sendMessage(conversationId, message),
    onSuccess: (newMessage, { conversationId }) => {
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

export const useClearConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.clearConversation(conversationId),
    onSuccess: (updatedConversation, conversationId) => {
      queryClient.setQueryData<Conversation>(
        ['chat', 'conversation', 'chapter', conversationId],
        updatedConversation
      );

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

      queryClient.removeQueries({ queryKey: ['chat', 'trackingProgress', conversationId] });
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
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number } };
          if (axiosError.response?.status === 404) {
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

export const useStreamMessage = () => {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tokens, setTokens] = useState<string[]>([]);

  const streamMessage = async ({
    conversationId,
    chapterId,
    content,
  }: {
    conversationId: string;
    chapterId: string;
    content: string;
  }) => {
    setIsStreaming(true);
    setError(null);
    setTokens([]);

    const cacheKey = ['chat', 'conversation', 'chapter', chapterId];

    const tempUserMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      content,
      role: ChatRole.USER,
      conversation: conversationId,
      created_at: new Date().toISOString(),
    };

    const tempAiMessage: ChatMessage = {
      id: `temp-ai-${Date.now()}`,
      content: '',
      role: ChatRole.ASSISTANT,
      conversation: conversationId,
      created_at: new Date().toISOString(),
    };

    queryClient.setQueryData<Conversation>(cacheKey, (oldData: Conversation | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        messages: [...oldData.messages, tempUserMessage, tempAiMessage],
      };
    });

    try {
      const fullResponse = await chatService.streamMessage(conversationId, content, {
        onStart: () => setIsStreaming(true),
        onToken: (token: string) => {
          setTokens(prev => [...prev, token]);

          queryClient.setQueryData<Conversation>(cacheKey, (oldData: Conversation | undefined) => {
            if (!oldData) return oldData;

            const messages = [...oldData.messages];
            const lastMessageIndex = messages.length - 1;

            if (lastMessageIndex >= 0 && messages[lastMessageIndex].role === ChatRole.ASSISTANT) {
              messages[lastMessageIndex] = {
                ...messages[lastMessageIndex],
                content: messages[lastMessageIndex].content + token,
              };
            }

            return {
              ...oldData,
              messages,
            };
          });
        },
        onComplete: async () => {
          setIsStreaming(false);

          queryClient.invalidateQueries({
            queryKey: cacheKey,
          });

          try {
            const { useChatStore } = await import('@/stores/core/chatStore');
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
                queryClient.invalidateQueries({ queryKey: ['chat', 'trackingProgress'] });
              },
              onError: () => {
                store.setProgressStreaming(false);
              },
            });
          } catch (error) {
            console.error('Error in progress tracking:', error);
          }
        },
        onError: (err: Error) => {
          setError(err);
          setIsStreaming(false);

          queryClient.invalidateQueries({
            queryKey: cacheKey,
          });
        },
      });
      setIsStreaming(false);
      return fullResponse;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsStreaming(false);

      queryClient.invalidateQueries({
        queryKey: cacheKey,
      });
      throw err;
    }
  };

  return { streamMessage, isStreaming, error, tokens };
};

export const useStreamProgressTracking = () => {
  const queryClient = useQueryClient();

  const streamProgressTracking = async (conversationId: string) => {
    try {
      const { useChatStore } = await import('@/stores/core/chatStore');
      const store = useChatStore.getState();

      await chatService.streamTrackingProgress(conversationId, {
        onStart: () => {
          store.setProgressStreaming(true);
          store.clearProgressTokens();
        },
        onToken: token => {
          store.addProgressToken(token);
        },
        onComplete: () => {
          store.setProgressStreaming(false);
          queryClient.invalidateQueries({ queryKey: ['chat', 'trackingProgress'] });
        },
        onError: () => {
          store.setProgressStreaming(false);
        },
      });
    } catch {
      const { useChatStore } = await import('@/stores/core/chatStore');
      const store = useChatStore.getState();
      store.setProgressStreaming(false);
    }
  };

  return { streamProgressTracking };
};
