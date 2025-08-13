import { create } from 'zustand';

import type { ChatMessage } from '@/types/chat';

interface ChatStoreState {
  selectedBotGroupId: number | null;
  setSelectedBotGroupId: (id: number | null) => void;
  selectedBotId: number | null;
  setSelectedBotId: (id: number | null) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  pendingMessages: ChatMessage[];
  addPendingMessage: (msg: ChatMessage) => void;
  removePendingMessage: (id: string) => void;

  isProgressStreaming: boolean;
  progressTokens: string[];
  setProgressStreaming: (streaming: boolean) => void;
  addProgressToken: (token: string) => void;
  clearProgressTokens: () => void;

  setBotContext: (botGroupId: number, botId: number, conversationId: string) => void;
  clearChatState: () => void;

  // Legacy compatibility methods (temporarily map to bot methods)
  selectedBookId: string | null;
  selectedChapterId: string | null;
  setChapterContext: (bookId: string, chapterId: string, conversationId: string) => void;
  setSelectedChapterId: (id: string | null) => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  selectedBotGroupId: null,
  setSelectedBotGroupId: id => set({ selectedBotGroupId: id }),
  selectedBotId: null,
  setSelectedBotId: id => set({ selectedBotId: id }),
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

  isProgressStreaming: false,
  progressTokens: [],
  setProgressStreaming: streaming => set({ isProgressStreaming: streaming }),
  addProgressToken: token => set(state => ({ progressTokens: [...state.progressTokens, token] })),
  clearProgressTokens: () => set({ progressTokens: [] }),

  setBotContext: (botGroupId, botId, conversationId) =>
    set({
      selectedBotGroupId: botGroupId,
      selectedBotId: botId,
      selectedConversationId: conversationId,
      inputValue: '',
      pendingMessages: [],
      progressTokens: [],
    }),

  clearChatState: () =>
    set({
      selectedBotGroupId: null,
      selectedBotId: null,
      selectedConversationId: null,
      inputValue: '',
      pendingMessages: [],
      progressTokens: [],
    }),

  // Legacy compatibility methods (map to bot methods for now)
  get selectedBookId() {
    const botGroupId = get().selectedBotGroupId;
    return botGroupId ? botGroupId.toString() : null;
  },
  get selectedChapterId() {
    const botId = get().selectedBotId;
    return botId ? botId.toString() : null;
  },
  setChapterContext: (bookId, chapterId, conversationId) =>
    set({
      selectedBotGroupId: parseInt(bookId),
      selectedBotId: parseInt(chapterId),
      selectedConversationId: conversationId,
      inputValue: '',
      pendingMessages: [],
      progressTokens: [],
    }),
  setSelectedChapterId: (id) => set({ selectedBotId: id ? parseInt(id) : null }),
}));
