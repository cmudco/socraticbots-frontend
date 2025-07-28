import { create } from 'zustand';

import type { Chapter } from '@/services/chapters.service';

import type { Book } from '@/types/book';

interface DeleteConfirmationModal {
  isOpen: boolean;
  itemId: string | null;
  itemTitle: string;
  itemType: string;
}

interface ModalStoreState {
  bookFormModal: {
    isOpen: boolean;
    book: Book | null;
    mode: 'create' | 'edit' | 'view';
  };
  deleteBookModal: {
    isOpen: boolean;
    book: Book | null;
  };

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

  clearConversationModal: {
    isOpen: boolean;
  };

  deleteConfirmationModal: DeleteConfirmationModal;

  openBookFormModal: (book?: Book, viewOnly?: boolean) => void;
  closeBookFormModal: () => void;
  openDeleteBookModal: (book: Book) => void;
  closeDeleteBookModal: () => void;

  openChapterFormModal: (bookId: string, chapter?: Chapter, viewOnly?: boolean) => void;
  closeChapterFormModal: () => void;
  openDeleteChapterModal: (bookId: string, chapter: Chapter) => void;
  closeDeleteChapterModal: () => void;

  openClearConversationModal: () => void;
  closeClearConversationModal: () => void;

  openDeleteConfirmation: (itemId: string, itemTitle: string, itemType: string) => void;
  closeDeleteConfirmation: () => void;

  resetAllModals: () => void;
}

export const useModalStore = create<ModalStoreState>(set => ({
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
  deleteConfirmationModal: {
    isOpen: false,
    itemId: null,
    itemTitle: '',
    itemType: '',
  },

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

  openDeleteConfirmation: (itemId: string, itemTitle: string, itemType: string) =>
    set({
      deleteConfirmationModal: {
        isOpen: true,
        itemId,
        itemTitle,
        itemType,
      },
    }),
  closeDeleteConfirmation: () =>
    set({
      deleteConfirmationModal: {
        isOpen: false,
        itemId: null,
        itemTitle: '',
        itemType: '',
      },
    }),

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
      deleteConfirmationModal: {
        isOpen: false,
        itemId: null,
        itemTitle: '',
        itemType: '',
      },
    }),
}));
