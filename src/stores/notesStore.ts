import { create } from 'zustand';

export interface Note {
  id: number;
  title: string;
  content: string;
  type: 'insight' | 'question' | 'concept';
  timestamp: string;
  isPinned: boolean;
}

interface NotesStoreState {
  // Core notes data
  notes: Note[];

  // UI state
  isCollapsed: boolean;
  searchTerm: string;
  isSearching: boolean;
  editingId: number | null;
  showCreateModal: boolean;
  createNoteType: 'insight' | 'question' | 'concept';

  // Form data for creating/editing
  newNoteTitle: string;
  newNoteContent: string;
  editTitle: string;
  editContent: string;

  // Actions
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
  setSearchTerm: (term: string) => void;
  setIsSearching: (searching: boolean) => void;

  // Note CRUD operations
  createNote: () => void;
  startEditing: (note: Note) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  togglePin: (id: number) => void;
  deleteNote: (id: number) => void;

  // Create modal management
  openCreateModal: (type: 'insight' | 'question' | 'concept') => void;
  closeCreateModal: () => void;
  setNewNoteTitle: (title: string) => void;
  setNewNoteContent: (content: string) => void;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;

  // Computed values
  getFilteredNotes: () => Note[];

  // Reset functions
  resetCreateForm: () => void;
  resetEditForm: () => void;
}

const initialNotes: Note[] = [
  {
    id: 1,
    title: 'Reasoning Evolution',
    content: 'Reasoning became an evolutionary advantage because it helped early humans solve complex problems, make better decisions, and cooperate in groups.',
    type: 'insight',
    timestamp: '2 min ago',
    isPinned: true,
  },
  {
    id: 2,
    title: "Piaget's Stages Question",
    content: 'How exactly do children transition between the concrete operational and formal operational stages?',
    type: 'question',
    timestamp: '5 min ago',
    isPinned: false,
  },
  {
    id: 3,
    title: 'Deductive vs Inductive',
    content: 'Deductive: General to specific (all birds have wings → sparrows have wings). Inductive: Specific to general (observed sparrows have wings → all birds have wings).',
    type: 'concept',
    timestamp: '10 min ago',
    isPinned: false,
  },
];

export const useNotesStore = create<NotesStoreState>((set, get) => ({
  // Initial state
  notes: initialNotes,
  isCollapsed: false,
  searchTerm: '',
  isSearching: false,
  editingId: null,
  showCreateModal: false,
  createNoteType: 'insight',
  newNoteTitle: '',
  newNoteContent: '',
  editTitle: '',
  editContent: '',

  // Basic UI actions
  setCollapsed: (collapsed: boolean) => {
    set({ isCollapsed: collapsed });
    if (collapsed) {
      // Reset UI state when collapsing
      set({
        isSearching: false,
        searchTerm: '',
        editingId: null,
        showCreateModal: false,
      });
    }
  },

  toggleCollapse: () => {
    const { isCollapsed } = get();
    get().setCollapsed(!isCollapsed);
  },

  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setIsSearching: (searching: boolean) => set({ isSearching: searching }),

  // Note CRUD operations
  createNote: () => {
    const { newNoteTitle, newNoteContent, createNoteType } = get();

    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

    const titles = {
      insight: newNoteTitle || 'New Insight',
      question: newNoteTitle || 'New Question',
      concept: newNoteTitle || 'New Concept',
    };

    const newNote: Note = {
      id: Date.now(),
      title: titles[createNoteType],
      content: newNoteContent || 'Note content...',
      type: createNoteType,
      timestamp: 'Just now',
      isPinned: false,
    };

    set(state => ({
      notes: [newNote, ...state.notes],
    }));

    get().closeCreateModal();
  },

  startEditing: (note: Note) => {
    set({
      editingId: note.id,
      editTitle: note.title,
      editContent: note.content,
    });
  },

  saveEdit: () => {
    const { editingId, editTitle, editContent } = get();
    if (!editingId) return;

    set(state => ({
      notes: state.notes.map(note =>
        note.id === editingId
          ? {
              ...note,
              title: editTitle.trim() || note.title,
              content: editContent.trim() || note.content,
            }
          : note
      ),
    }));

    get().resetEditForm();
  },

  cancelEdit: () => {
    get().resetEditForm();
  },

  togglePin: (id: number) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      ),
    }));
  },

  deleteNote: (id: number) => {
    set(state => ({
      notes: state.notes.filter(note => note.id !== id),
    }));

    const { editingId } = get();
    if (editingId === id) {
      get().resetEditForm();
    }
  },

  // Create modal management
  openCreateModal: (type: 'insight' | 'question' | 'concept') => {
    set({
      createNoteType: type,
      showCreateModal: true,
    });
    get().resetCreateForm();
  },

  closeCreateModal: () => {
    set({ showCreateModal: false });
    get().resetCreateForm();
  },

  setNewNoteTitle: (title: string) => set({ newNoteTitle: title }),
  setNewNoteContent: (content: string) => set({ newNoteContent: content }),
  setEditTitle: (title: string) => set({ editTitle: title }),
  setEditContent: (content: string) => set({ editContent: content }),

  // Computed values
  getFilteredNotes: () => {
    const { notes, searchTerm } = get();
    return notes.filter(
      note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // Reset functions
  resetCreateForm: () => {
    set({
      newNoteTitle: '',
      newNoteContent: '',
    });
  },

  resetEditForm: () => {
    set({
      editingId: null,
      editTitle: '',
      editContent: '',
    });
  },
}));