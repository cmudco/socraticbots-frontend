import { create } from 'zustand';

import type { ChatMessage } from '@/types/chat';

interface ChatStoreState {
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  selectedChapterId: string | null;
  setSelectedChapterId: (id: string | null) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  pendingMessages: ChatMessage[];
  addPendingMessage: (msg: ChatMessage) => void;
  removePendingMessage: (id: string) => void;

  // Progress streaming state
  isProgressStreaming: boolean;
  progressTokens: string[];
  setProgressStreaming: (streaming: boolean) => void;
  addProgressToken: (token: string) => void;
  clearProgressTokens: () => void;

  // Helper method to set chapter and clear related state
  setChapterContext: (bookId: string, chapterId: string, conversationId: string) => void;
  // Clear all chat state
  clearChatState: () => void;
  // Add more UI state as needed (drafts, typing, etc.)
}

export const useChatStore = create<ChatStoreState>(set => ({
  selectedBookId: null,
  setSelectedBookId: id => set({ selectedBookId: id }),
  selectedChapterId: null,
  setSelectedChapterId: id => set({ selectedChapterId: id }),
  selectedConversationId: null,
  setSelectedConversationId: id => set({ selectedConversationId: id }),
  inputValue: '',
  setInputValue: value => set({ inputValue: value }),
  isSidebarOpen: false,
  setSidebarOpen: open => set({ isSidebarOpen: open }),
  pendingMessages: [],
  addPendingMessage: msg => set(state => ({ pendingMessages: [...state.pendingMessages, msg] })),
  removePendingMessage: id =>
    set(state => ({ pendingMessages: state.pendingMessages.filter(m => m.id !== id) })),

  // Progress streaming state
  isProgressStreaming: false,
  progressTokens: [],
  setProgressStreaming: streaming => set({ isProgressStreaming: streaming }),
  addProgressToken: token => set(state => ({ progressTokens: [...state.progressTokens, token] })),
  clearProgressTokens: () => set({ progressTokens: [] }),

  // Helper method to set all chapter context at once
  setChapterContext: (bookId, chapterId, conversationId) =>
    set({
      selectedBookId: bookId,
      selectedChapterId: chapterId,
      selectedConversationId: conversationId,
      inputValue: '', // Clear input when switching chapters
      pendingMessages: [], // Clear pending messages when switching chapters
      progressTokens: [], // Clear progress tokens when switching chapters
    }),

  // Clear all chat state
  clearChatState: () =>
    set({
      selectedBookId: null,
      selectedChapterId: null,
      selectedConversationId: null,
      inputValue: '',
      pendingMessages: [],
      progressTokens: [],
    }),
}));
