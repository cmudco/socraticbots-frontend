// src/stores/uiStore.ts
import { create } from 'zustand';

interface UiStore {
  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Book expansion state (for books page)
  expandedBooks: Set<string>;
  toggleBookExpansion: (bookId: string) => void;
  setBookExpanded: (bookId: string, expanded: boolean) => void;
  clearExpandedBooks: () => void;

  // Deleted chapters tracking (for immediate UI feedback)
  deletedChapterIds: Set<string>;
  addDeletedChapter: (chapterId: string) => void;
  removeDeletedChapter: (chapterId: string) => void;
  clearDeletedChapters: () => void;
}

export const useUiStore = create<UiStore>(set => ({
  // Initial state
  sidebarCollapsed: false,
  expandedBooks: new Set(),
  deletedChapterIds: new Set(),

  // Sidebar actions
  toggleSidebar: () =>
    set(state => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),

  setSidebarCollapsed: collapsed =>
    set({
      sidebarCollapsed: collapsed,
    }),

  // Book expansion actions
  toggleBookExpansion: bookId =>
    set(state => {
      const newExpandedBooks = new Set(state.expandedBooks);
      if (newExpandedBooks.has(bookId)) {
        newExpandedBooks.delete(bookId);
      } else {
        newExpandedBooks.add(bookId);
      }
      return { expandedBooks: newExpandedBooks };
    }),

  setBookExpanded: (bookId, expanded) =>
    set(state => {
      const newExpandedBooks = new Set(state.expandedBooks);
      if (expanded) {
        newExpandedBooks.add(bookId);
      } else {
        newExpandedBooks.delete(bookId);
      }
      return { expandedBooks: newExpandedBooks };
    }),

  clearExpandedBooks: () => set({ expandedBooks: new Set() }),

  // Deleted chapters tracking
  addDeletedChapter: chapterId =>
    set(state => ({
      deletedChapterIds: new Set([...state.deletedChapterIds, chapterId]),
    })),

  removeDeletedChapter: chapterId =>
    set(state => {
      const newDeleted = new Set(state.deletedChapterIds);
      newDeleted.delete(chapterId);
      return { deletedChapterIds: newDeleted };
    }),

  clearDeletedChapters: () => set({ deletedChapterIds: new Set() }),
}));
