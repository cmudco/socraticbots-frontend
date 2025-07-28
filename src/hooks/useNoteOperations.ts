import { useMemo } from 'react';

import { DEFAULT_NOTE_CONTENT, DEFAULT_NOTE_TITLES } from '@/constants/notes';

import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useTogglePin,
  useUpdateNote,
} from '@/hooks/queries/useNotes';

import { useChatStore } from '@/stores/core/chatStore';
import { notesSelectors, useNotesStore } from '@/stores/core/notesStore';
import { useModalStore } from '@/stores/ui/modalStore';

import { CreateNoteRequest } from '@/services/notes.service';

import { filterNotes, groupNotesByPinStatus } from '@/utils/notes';

import type { Note } from '@/types/note';

export const useNoteOperations = () => {
  const { selectedChapterId } = useChatStore();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const togglePinMutation = useTogglePin();

  const notesStore = useNotesStore();
  const { searchTerm, editingId, closeCreateModal, resetEdit, startEditing } = notesStore;

  const showCreateModal = notesSelectors.showCreateModal(notesStore);
  const createNoteType = notesSelectors.createNoteType(notesStore);
  const newNoteTitle = notesSelectors.newNoteTitle(notesStore);
  const newNoteContent = notesSelectors.newNoteContent(notesStore);
  const editTitle = notesSelectors.editTitle(notesStore);
  const editContent = notesSelectors.editContent(notesStore);

  const { deleteConfirmationModal, openDeleteConfirmation, closeDeleteConfirmation } =
    useModalStore();

  const { data: notes = [], isLoading } = useNotes();

  const filteredNotes = useMemo(() => {
    return filterNotes(notes, searchTerm);
  }, [notes, searchTerm]);

  const groupedNotes = useMemo(() => {
    return groupNotesByPinStatus(filteredNotes);
  }, [filteredNotes]);

  const handleCreateNote = async () => {
    if (!selectedChapterId) {
      return;
    }

    const noteData: CreateNoteRequest = {
      title: newNoteTitle.trim() || DEFAULT_NOTE_TITLES[createNoteType],
      content: newNoteContent.trim() || DEFAULT_NOTE_CONTENT,
      type: createNoteType,
      isPinned: false,
      chapter_id: selectedChapterId,
    };

    try {
      await createNoteMutation.mutateAsync(noteData);
      closeCreateModal();
    } catch {
      // Handle error silently - no toast notifications
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateNoteMutation.mutateAsync({
        id: editingId,
        noteData: {
          title: editTitle.trim(),
          content: editContent.trim(),
        },
      });
      resetEdit();
    } catch {
      // Handle error silently - no toast notifications
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNoteMutation.mutateAsync(id);
      if (editingId === id) {
        resetEdit();
      }
      closeDeleteConfirmation();
    } catch {
      // Handle error silently - no toast notifications
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await togglePinMutation.mutateAsync(id);
    } catch {
      // Handle error silently - no toast notifications
    }
  };

  const handleStartEditing = (note: Note) => {
    startEditing(note.id, { title: note.title, content: note.content });
  };

  const handleOpenDeleteConfirmation = (note: Note) => {
    openDeleteConfirmation(note.id, note.title, 'note');
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmationModal.itemId) {
      handleDeleteNote(deleteConfirmationModal.itemId);
    }
  };

  return {
    notes,
    filteredNotes,
    groupedNotes,
    isLoading,
    selectedChapterId,
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
    togglePinMutation,
    handleCreateNote,
    handleSaveEdit,
    handleDeleteNote,
    handleTogglePin,
    handleStartEditing,
    handleOpenDeleteConfirmation,
    handleConfirmDelete,
    deleteConfirmation: deleteConfirmationModal,
    editingId,
    showCreateModal,
    createNoteType,
    newNoteTitle,
    newNoteContent,
    editTitle,
    editContent,
  };
};
