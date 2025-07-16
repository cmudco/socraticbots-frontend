import { create } from 'zustand';

interface UiStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  expandedBooks: Set<string>;
  toggleBookExpansion: (bookId: string) => void;
  setBookExpanded: (bookId: string, expanded: boolean) => void;
  clearExpandedBooks: () => void;

  deletedChapterIds: Set<string>;
  addDeletedChapter: (chapterId: string) => void;
  removeDeletedChapter: (chapterId: string) => void;
  clearDeletedChapters: () => void;
}

export const useUiStore = create<UiStore>(set => ({
  sidebarCollapsed: false,
  expandedBooks: new Set(),
  deletedChapterIds: new Set(),

  toggleSidebar: () =>
    set(state => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),

  setSidebarCollapsed: collapsed =>
    set({
      sidebarCollapsed: collapsed,
    }),

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
