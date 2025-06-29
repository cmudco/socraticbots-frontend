// src/stores/uiStore.ts
import { create } from 'zustand';

interface UiStore {
  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Book expansion state
  expandedBooks: Set<string>;
  toggleBookExpansion: (bookId: string) => void;
  setBookExpanded: (bookId: string, expanded: boolean) => void;
}

export const useUiStore = create<UiStore>(set => ({
  // Initial state
  sidebarCollapsed: false,
  expandedBooks: new Set(),

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
}));
