import { create } from 'zustand';

import { FileUploadStatus } from '@/types/file';

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: FileUploadStatus;
  error?: string;
}

interface DeleteModalState {
  isOpen: boolean;
  fileId: string;
  fileName: string;
}

interface FilesState {
  // UI state
  dragActive: boolean;
  uploadingFiles: UploadingFile[];
  deleteModal: DeleteModalState;

  // Actions
  setDragActive: (active: boolean) => void;
  addUploadingFile: (file: UploadingFile) => void;
  updateUploadingFile: (id: string, updates: Partial<UploadingFile>) => void;
  removeUploadingFile: (id: string) => void;
  clearUploadingFiles: () => void;
  openDeleteModal: (fileId: string, fileName: string) => void;
  closeDeleteModal: () => void;
}

const initialState = {
  dragActive: false,
  uploadingFiles: [],
  deleteModal: {
    isOpen: false,
    fileId: '',
    fileName: '',
  },
};

export const useFilesStore = create<FilesState>(set => ({
  ...initialState,

  setDragActive: (active: boolean) => set({ dragActive: active }),

  addUploadingFile: (file: UploadingFile) =>
    set(state => ({
      uploadingFiles: [...state.uploadingFiles, file],
    })),

  updateUploadingFile: (id: string, updates: Partial<UploadingFile>) =>
    set(state => ({
      uploadingFiles: state.uploadingFiles.map(file =>
        file.id === id ? { ...file, ...updates } : file
      ),
    })),

  removeUploadingFile: (id: string) =>
    set(state => ({
      uploadingFiles: state.uploadingFiles.filter(file => file.id !== id),
    })),

  clearUploadingFiles: () => set({ uploadingFiles: [] }),

  openDeleteModal: (fileId: string, fileName: string) =>
    set({
      deleteModal: {
        isOpen: true,
        fileId,
        fileName,
      },
    }),

  closeDeleteModal: () =>
    set({
      deleteModal: {
        isOpen: false,
        fileId: '',
        fileName: '',
      },
    }),
}));
