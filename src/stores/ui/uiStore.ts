import { create } from 'zustand';

interface UiStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Bot Groups (formerly books)
  expandedBotGroups: Set<number>;
  toggleBotGroupExpansion: (botGroupId: number) => void;
  setBotGroupExpanded: (botGroupId: number, expanded: boolean) => void;
  clearExpandedBotGroups: () => void;

  // Bots (formerly chapters) 
  deletedBotIds: Set<number>;
  addDeletedBot: (botId: number) => void;
  removeDeletedBot: (botId: number) => void;
  clearDeletedBots: () => void;

  // Legacy support - maintain old names temporarily for backward compatibility
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
  expandedBotGroups: new Set(),
  deletedBotIds: new Set(),
  // Legacy support
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

  // Bot Groups methods
  toggleBotGroupExpansion: botGroupId =>
    set(state => {
      const newExpandedBotGroups = new Set(state.expandedBotGroups);
      if (newExpandedBotGroups.has(botGroupId)) {
        newExpandedBotGroups.delete(botGroupId);
      } else {
        newExpandedBotGroups.add(botGroupId);
      }
      return { expandedBotGroups: newExpandedBotGroups };
    }),

  setBotGroupExpanded: (botGroupId, expanded) =>
    set(state => {
      const newExpandedBotGroups = new Set(state.expandedBotGroups);
      if (expanded) {
        newExpandedBotGroups.add(botGroupId);
      } else {
        newExpandedBotGroups.delete(botGroupId);
      }
      return { expandedBotGroups: newExpandedBotGroups };
    }),

  clearExpandedBotGroups: () => set({ expandedBotGroups: new Set() }),

  // Bots methods
  addDeletedBot: botId =>
    set(state => ({
      deletedBotIds: new Set([...state.deletedBotIds, botId]),
    })),

  removeDeletedBot: botId =>
    set(state => {
      const newDeleted = new Set(state.deletedBotIds);
      newDeleted.delete(botId);
      return { deletedBotIds: newDeleted };
    }),

  clearDeletedBots: () => set({ deletedBotIds: new Set() }),

  // Legacy methods - keep for backward compatibility during migration
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
