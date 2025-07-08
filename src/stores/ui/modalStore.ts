import { create } from 'zustand';

import type { Chapter } from '@/services/chapters.service';

import type { Book } from '@/types/book';

interface ModalStoreState {
  // Book modals
  bookFormModal: {
    isOpen: boolean;
    book: Book | null;
    mode: 'create' | 'edit' | 'view';
  };
  deleteBookModal: {
    isOpen: boolean;
    book: Book | null;
  };

  // Chapter modals
  chapterFormModal: {
    isOpen: boolean;
    chapter: Chapter | null;
    bookId: string | null;
    mode: 'create' | 'edit' | 'view';
  };
  deleteChapterModal: {
    isOpen: boolean;
    chapter: Chapter | null;
    bookId: string | null;
  };

  // Chat modals
  clearConversationModal: {
    isOpen: boolean;
  };

  // Book modal actions
  openBookFormModal: (book?: Book, viewOnly?: boolean) => void;
  closeBookFormModal: () => void;
  openDeleteBookModal: (book: Book) => void;
  closeDeleteBookModal: () => void;

  // Chapter modal actions
  openChapterFormModal: (bookId: string, chapter?: Chapter, viewOnly?: boolean) => void;
  closeChapterFormModal: () => void;
  openDeleteChapterModal: (bookId: string, chapter: Chapter) => void;
  closeDeleteChapterModal: () => void;

  // Chat modal actions
  openClearConversationModal: () => void;
  closeClearConversationModal: () => void;

  // Reset all modals
  resetAllModals: () => void;
}

export const useModalStore = create<ModalStoreState>(set => ({
  // Initial state
  bookFormModal: {
    isOpen: false,
    book: null,
    mode: 'create',
  },
  deleteBookModal: {
    isOpen: false,
    book: null,
  },
  chapterFormModal: {
    isOpen: false,
    chapter: null,
    bookId: null,
    mode: 'create',
  },
  deleteChapterModal: {
    isOpen: false,
    chapter: null,
    bookId: null,
  },
  clearConversationModal: {
    isOpen: false,
  },

  // Book modal actions
  openBookFormModal: (book?: Book, viewOnly?: boolean) =>
    set({
      bookFormModal: {
        isOpen: true,
        book: book || null,
        mode: viewOnly ? 'view' : book ? 'edit' : 'create',
      },
    }),
  closeBookFormModal: () =>
    set({
      bookFormModal: {
        isOpen: false,
        book: null,
        mode: 'create',
      },
    }),
  openDeleteBookModal: (book: Book) =>
    set({
      deleteBookModal: {
        isOpen: true,
        book,
      },
    }),
  closeDeleteBookModal: () =>
    set({
      deleteBookModal: {
        isOpen: false,
        book: null,
      },
    }),

  // Chapter modal actions
  openChapterFormModal: (bookId: string, chapter?: Chapter, viewOnly?: boolean) =>
    set({
      chapterFormModal: {
        isOpen: true,
        chapter: chapter || null,
        bookId,
        mode: viewOnly ? 'view' : chapter ? 'edit' : 'create',
      },
    }),
  closeChapterFormModal: () =>
    set({
      chapterFormModal: {
        isOpen: false,
        chapter: null,
        bookId: null,
        mode: 'create',
      },
    }),
  openDeleteChapterModal: (bookId: string, chapter: Chapter) =>
    set({
      deleteChapterModal: {
        isOpen: true,
        chapter,
        bookId,
      },
    }),
  closeDeleteChapterModal: () =>
    set({
      deleteChapterModal: {
        isOpen: false,
        chapter: null,
        bookId: null,
      },
    }),

  // Chat modal actions
  openClearConversationModal: () =>
    set({
      clearConversationModal: {
        isOpen: true,
      },
    }),
  closeClearConversationModal: () =>
    set({
      clearConversationModal: {
        isOpen: false,
      },
    }),

  // Reset all modals
  resetAllModals: () =>
    set({
      bookFormModal: {
        isOpen: false,
        book: null,
        mode: 'create',
      },
      deleteBookModal: {
        isOpen: false,
        book: null,
      },
      chapterFormModal: {
        isOpen: false,
        chapter: null,
        bookId: null,
        mode: 'create',
      },
      deleteChapterModal: {
        isOpen: false,
        chapter: null,
        bookId: null,
      },
      clearConversationModal: {
        isOpen: false,
      },
    }),
}));
