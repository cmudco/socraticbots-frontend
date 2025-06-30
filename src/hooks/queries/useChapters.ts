// src/hooks/queries/useChapters.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import {
  Chapter,
  ChapterModelPreferenceRequest,
  ChapterPromptRequest,
  CreateChapterRequest,
  UpdateChapterRequest,
  chapterService,
} from '@/services/chapters.service';

// Query Keys
export const chapterKeys = {
  all: ['chapters'] as const,
  lists: () => [...chapterKeys.all, 'list'] as const,
  list: (bookId: string) => [...chapterKeys.lists(), bookId] as const,
  details: () => [...chapterKeys.all, 'detail'] as const,
  detail: (bookId: string, chapterId: string) =>
    [...chapterKeys.details(), bookId, chapterId] as const,
};

// Query Hooks

/**
 * Get all chapters for a specific book
 */
export const useChapters = (bookId: string, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: chapterKeys.list(bookId),
    queryFn: () => chapterService.getChapters(bookId),
    enabled: enabled && !!bookId && isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get a single chapter by ID
 */
export const useChapter = (bookId: string, chapterId: string, enabled: boolean = true) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: chapterKeys.detail(bookId, chapterId),
    queryFn: () => chapterService.getChapter(bookId, chapterId),
    enabled: enabled && !!bookId && !!chapterId && isAuthenticated && !!tokens?.access,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutation Hooks

/**
 * Create a new chapter
 */
export const useCreateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookId,
      chapterData,
      modelPreferences,
      promptData,
    }: {
      bookId: string;
      chapterData: CreateChapterRequest;
      modelPreferences?: ChapterModelPreferenceRequest;
      promptData?: ChapterPromptRequest;
    }) => chapterService.createChapter(bookId, chapterData, modelPreferences, promptData),
    onSuccess: (newChapter: Chapter, { bookId }) => {
      // Add to cache optimistically
      queryClient.setQueryData<Chapter[]>(chapterKeys.list(bookId), oldChapters => {
        return oldChapters ? [...oldChapters, newChapter] : [newChapter];
      });

      // Invalidate and refetch chapter-related queries
      queryClient.invalidateQueries({ queryKey: chapterKeys.list(bookId) });
    },
    onError: error => {
      console.error('Failed to create chapter:', error);
    },
  });
};

/**
 * Update an existing chapter
 */
export const useUpdateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookId,
      chapterId,
      chapterData,
      modelPreferences,
      promptData,
    }: {
      bookId: string;
      chapterId: string;
      chapterData: UpdateChapterRequest;
      modelPreferences?: ChapterModelPreferenceRequest;
      promptData?: ChapterPromptRequest;
    }) =>
      chapterService.updateChapter(bookId, chapterId, chapterData, modelPreferences, promptData),
    onSuccess: (updatedChapter: Chapter, { bookId, chapterId }) => {
      // Update the specific chapter in cache
      queryClient.setQueryData<Chapter>(chapterKeys.detail(bookId, chapterId), updatedChapter);

      // Update chapter in the list cache
      queryClient.setQueryData<Chapter[]>(chapterKeys.list(bookId), oldChapters => {
        return oldChapters
          ? oldChapters.map(chapter => (chapter.id === chapterId ? updatedChapter : chapter))
          : [updatedChapter];
      });
    },
    onError: error => {
      console.error('Failed to update chapter:', error);
    },
  });
};

/**
 * Delete a chapter
 */
export const useDeleteChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, chapterId }: { bookId: string; chapterId: string }) =>
      chapterService.deleteChapter(bookId, chapterId),
    onSuccess: (_, { bookId, chapterId }) => {
      // Remove from list cache
      queryClient.setQueryData<Chapter[]>(chapterKeys.list(bookId), oldChapters => {
        return oldChapters ? oldChapters.filter(chapter => chapter.id !== chapterId) : [];
      });

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: chapterKeys.detail(bookId, chapterId) });
    },
    onError: error => {
      console.error('Failed to delete chapter:', error);
    },
  });
};
