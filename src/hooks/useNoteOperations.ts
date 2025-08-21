import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notesService, CreateNoteRequest, UpdateNoteRequest } from '@/services/notes.service';


export const useNoteOperations = (selectedBotId: string | null) => {
  const queryClient = useQueryClient();
  
  // Query for notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', selectedBotId],
    queryFn: () => selectedBotId ? notesService.getNotes(selectedBotId) : Promise.resolve([]),
    enabled: !!selectedBotId,
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (noteData: CreateNoteRequest) => notesService.createNote(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', selectedBotId] });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, noteData }: { id: string; noteData: UpdateNoteRequest }) => 
      notesService.updateNote(id, noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', selectedBotId] });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => notesService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', selectedBotId] });
    },
  });

  // Simple handlers
  const handleCreateNote = async (title: string, content: string) => {
    if (!selectedBotId) return;
    
    await createNoteMutation.mutateAsync({
      title: title.trim(),
      content: content.trim(),
      botId: selectedBotId,
    });
  };

  const handleUpdateNote = async (noteId: string, title: string, content: string) => {
    await updateNoteMutation.mutateAsync({
      id: noteId,
      noteData: {
        title: title.trim(),
        content: content.trim(),
      },
    });
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNoteMutation.mutateAsync(noteId);
  };

  return {
    notes,
    isLoading,
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
};
