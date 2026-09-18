import { create } from 'zustand';

interface CreateNoteFormData {
  title: string;
  content: string;
}

interface EditingData {
  noteId: string;
  title: string;
  content: string;
}

interface DeleteConfirmationData {
  isOpen: boolean;
  noteId: string | null;
  noteTitle: string;
}

interface NotesStoreState {
  // Collapse state
  isCollapsed: boolean;
  
  // Form state for creating notes
  isCreating: boolean;
  createForm: CreateNoteFormData;
  
  // Editing state
  editingData: EditingData | null;
  
  // Delete confirmation state
  deleteConfirmation: DeleteConfirmationData;
  
  // Actions for collapse
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
  
  // Actions for creating notes
  openCreateForm: () => void;
  closeCreateForm: () => void;
  setCreateTitle: (title: string) => void;
  setCreateContent: (content: string) => void;
  resetCreateForm: () => void;
  
  // Actions for editing notes
  startEditing: (noteId: string, data: { title: string; content: string }) => void;
  cancelEdit: () => void;
  setEditTitle: (title: string) => void;
  setEditContent: (content: string) => void;
  
  // Actions for delete confirmation
  openDeleteConfirmation: (noteId: string, noteTitle: string) => void;
  closeDeleteConfirmation: () => void;
}

const initialCreateForm: CreateNoteFormData = {
  title: '',
  content: '',
};

const initialDeleteConfirmation: DeleteConfirmationData = {
  isOpen: false,
  noteId: null,
  noteTitle: '',
};

export const useNotesStore = create<NotesStoreState>((set) => ({
  // Initial state
  isCollapsed: true,
  isCreating: false,
  createForm: initialCreateForm,
  editingData: null,
  deleteConfirmation: initialDeleteConfirmation,

  // Collapse actions
  setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

  // Create form actions
  openCreateForm: () => set({ isCreating: true }),
  closeCreateForm: () => set({ 
    isCreating: false, 
    createForm: initialCreateForm 
  }),
  setCreateTitle: (title: string) => 
    set((state) => ({ 
      createForm: { ...state.createForm, title } 
    })),
  setCreateContent: (content: string) => 
    set((state) => ({ 
      createForm: { ...state.createForm, content } 
    })),
  resetCreateForm: () => set({ createForm: initialCreateForm }),

  // Edit actions
  startEditing: (noteId: string, data: { title: string; content: string }) => 
    set({ 
      editingData: { 
        noteId, 
        title: data.title, 
        content: data.content 
      } 
    }),
  cancelEdit: () => set({ editingData: null }),
  setEditTitle: (title: string) => 
    set((state) => 
      state.editingData 
        ? { editingData: { ...state.editingData, title } }
        : state
    ),
  setEditContent: (content: string) => 
    set((state) => 
      state.editingData 
        ? { editingData: { ...state.editingData, content } }
        : state
    ),

  // Delete confirmation actions
  openDeleteConfirmation: (noteId: string, noteTitle: string) => 
    set({ 
      deleteConfirmation: { 
        isOpen: true, 
        noteId, 
        noteTitle 
      } 
    }),
  closeDeleteConfirmation: () => 
    set({ deleteConfirmation: initialDeleteConfirmation }),
}));
