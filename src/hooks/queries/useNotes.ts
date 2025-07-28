import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/core/chatStore';

import { CreateNoteRequest, UpdateNoteRequest, notesService } from '@/services/notes.service';

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (chapterId?: string) => [...noteKeys.lists(), { chapterId }] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
  search: (query: string, chapterId?: string) =>
    [...noteKeys.all, 'search', query, { chapterId }] as const,
  byType: (type: string, chapterId?: string) =>
    [...noteKeys.all, 'type', type, { chapterId }] as const,
  pinned: (chapterId?: string) => [...noteKeys.all, 'pinned', { chapterId }] as const,
  byChapter: (chapterId: string) => [...noteKeys.all, 'chapter', chapterId] as const,
};

export const useNotes = () => {
  const { isAuthenticated, tokens } = useAuthStore();
  const { selectedChapterId } = useChatStore();

  return useQuery({
    queryKey: noteKeys.list(selectedChapterId || undefined),
    queryFn: () => notesService.getNotes(selectedChapterId || undefined),
    enabled: isAuthenticated && !!tokens?.access,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useNotesByChapter = (chapterId: string) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: noteKeys.byChapter(chapterId),
    queryFn: () => notesService.getNotesByChapter(chapterId),
    enabled: isAuthenticated && !!tokens?.access && !!chapterId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useNote = (id: string) => {
  const { isAuthenticated, tokens } = useAuthStore();

  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => notesService.getNote(id),
    enabled: isAuthenticated && !!tokens?.access && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSearchNotes = (query: string) => {
  const { isAuthenticated, tokens } = useAuthStore();
  const { selectedChapterId } = useChatStore();

  return useQuery({
    queryKey: noteKeys.search(query, selectedChapterId || undefined),
    queryFn: () => notesService.searchNotes(query, selectedChapterId || undefined),
    enabled: isAuthenticated && !!tokens?.access && query.trim().length > 0,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
};

export const useNotesByType = (type: 'insight' | 'question' | 'concept') => {
  const { isAuthenticated, tokens } = useAuthStore();
  const { selectedChapterId } = useChatStore();

  return useQuery({
    queryKey: noteKeys.byType(type, selectedChapterId || undefined),
    queryFn: () => notesService.getNotesByType(type, selectedChapterId || undefined),
    enabled: isAuthenticated && !!tokens?.access,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const usePinnedNotes = () => {
  const { isAuthenticated, tokens } = useAuthStore();
  const { selectedChapterId } = useChatStore();

  return useQuery({
    queryKey: noteKeys.pinned(selectedChapterId || undefined),
    queryFn: () => notesService.getPinnedNotes(selectedChapterId || undefined),
    enabled: isAuthenticated && !!tokens?.access,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  const { selectedChapterId } = useChatStore();

  return useMutation({
    mutationFn: (noteData: CreateNoteRequest) => notesService.createNote(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      if (selectedChapterId) {
        queryClient.invalidateQueries({ queryKey: noteKeys.byChapter(selectedChapterId) });
      }
    },
    onError: () => {
      // Handle error silently - no toast notifications
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  const { selectedChapterId } = useChatStore();

  return useMutation({
    mutationFn: ({ id, noteData }: { id: string; noteData: UpdateNoteRequest }) =>
      notesService.updateNote(id, noteData),
    onSuccess: updatedNote => {
      queryClient.setQueryData(noteKeys.detail(updatedNote.id), updatedNote);
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      if (selectedChapterId) {
        queryClient.invalidateQueries({ queryKey: noteKeys.byChapter(selectedChapterId) });
      }
    },
    onError: () => {
      // Handle error silently - no toast notifications
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const { selectedChapterId } = useChatStore();

  return useMutation({
    mutationFn: (id: string) => notesService.deleteNote(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: noteKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      if (selectedChapterId) {
        queryClient.invalidateQueries({ queryKey: noteKeys.byChapter(selectedChapterId) });
      }
    },
    onError: () => {
      // Handle error silently - no toast notifications
    },
  });
};

export const useTogglePin = () => {
  const queryClient = useQueryClient();
  const { selectedChapterId } = useChatStore();

  return useMutation({
    mutationFn: (id: string) => notesService.togglePin(id),
    onSuccess: updatedNote => {
      queryClient.setQueryData(noteKeys.detail(updatedNote.id), updatedNote);
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.pinned() });
      if (selectedChapterId) {
        queryClient.invalidateQueries({ queryKey: noteKeys.byChapter(selectedChapterId) });
      }
    },
    onError: () => {
      // Handle error silently - no toast notifications
    },
  });
};
