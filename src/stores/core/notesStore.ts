import { create } from 'zustand';

import {
  type CollapsibleState,
  type EditingState,
  type FormState,
  type SearchState,
  createCollapsibleActions,
  createCollapsibleState,
  createEditingActions,
  createEditingState,
  createFormState,
  createSearchActions,
  createSearchState,
} from '@/stores/utils/formStateHelpers';

import { NoteType } from '@/types/note';

interface CreateNoteFormData {
  title: string;
  content: string;
  type: NoteType;
}

interface NotesStoreState extends CollapsibleState, SearchState, EditingState {
  createNoteForm: FormState<CreateNoteFormData>;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
  setSearchTerm: (term: string) => void;
  setIsSearching: (searching: boolean) => void;
  clearSearch: () => void;
  startEditing: (id: string, data: { title: string; content: string }) => void;
  cancelEdit: () => void;
  resetEdit: () => void;
  openCreateModal: (type: NoteType) => void;
  closeCreateModal: () => void;
  setNewNoteTitle: (title: string) => void;
  setNewNoteContent: (content: string) => void;
  resetCreateForm: () => void;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
}

export const notesSelectors = {
  showCreateModal: (state: NotesStoreState) => state.createNoteForm.isOpen,
  createNoteType: (state: NotesStoreState) => state.createNoteForm.data.type,
  newNoteTitle: (state: NotesStoreState) => state.createNoteForm.data.title,
  newNoteContent: (state: NotesStoreState) => state.createNoteForm.data.content,
  editTitle: (state: NotesStoreState) => (state.editData?.title as string) || '',
  editContent: (state: NotesStoreState) => (state.editData?.content as string) || '',
};

const initialCreateFormData: CreateNoteFormData = {
  title: '',
  content: '',
  type: NoteType.INSIGHT,
};

export const useNotesStore = create<NotesStoreState>((set, get) => {
  const collapsibleActions = createCollapsibleActions();
  const searchActions = createSearchActions();
  const editingActions = createEditingActions();

  return {
    ...createCollapsibleState(),
    ...createSearchState(),
    ...createEditingState(),
    createNoteForm: createFormState(initialCreateFormData),

    setCollapsed: (collapsed: boolean) => collapsibleActions.setCollapsed(collapsed)(set, get as any),
    toggleCollapse: () => collapsibleActions.toggleCollapse()(set, get as any),
    setSearchTerm: (term: string) => searchActions.setSearchTerm(term)(set),
    setIsSearching: (searching: boolean) => searchActions.setIsSearching(searching)(set),
    clearSearch: () => searchActions.clearSearch()(set),
    startEditing: (id: string, data: { title: string; content: string }) =>
      editingActions.startEditing(id, data)(set),
    cancelEdit: () => editingActions.cancelEdit()(set),
    resetEdit: () => editingActions.resetEdit()(set),

    openCreateModal: (type: NoteType) => {
      set({
        createNoteForm: {
          isOpen: true,
          data: { ...initialCreateFormData, type },
          mode: 'create',
        },
      });
    },

    closeCreateModal: () => {
      set({
        createNoteForm: createFormState(initialCreateFormData),
      });
    },

    setNewNoteTitle: (title: string) => {
      const { createNoteForm } = get();
      set({
        createNoteForm: {
          ...createNoteForm,
          data: { ...createNoteForm.data, title },
        },
      });
    },

    setNewNoteContent: (content: string) => {
      const { createNoteForm } = get();
      set({
        createNoteForm: {
          ...createNoteForm,
          data: { ...createNoteForm.data, content },
        },
      });
    },

    resetCreateForm: () => {
      const { createNoteForm } = get();
      set({
        createNoteForm: {
          ...createNoteForm,
          data: initialCreateFormData,
        },
      });
    },

    setEditTitle: (title: string) => {
      const { editData } = get();
      set({
        editData: { ...editData, title },
      });
    },

    setEditContent: (content: string) => {
      const { editData } = get();
      set({
        editData: { ...editData, content },
      });
    },
  };
});
