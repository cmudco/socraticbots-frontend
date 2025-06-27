import { create } from 'zustand';
import type { ChatMessage } from '@/types/chat';

interface ChatStoreState {
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
  // Add more UI state as needed (drafts, typing, etc.)
}

export const useChatStore = create<ChatStoreState>((set) => ({
  selectedChapterId: null,
  setSelectedChapterId: (id) => set({ selectedChapterId: id }),
  selectedConversationId: null,
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
  inputValue: '',
  setInputValue: (value) => set({ inputValue: value }),
  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  pendingMessages: [],
  addPendingMessage: (msg) => set((state) => ({ pendingMessages: [...state.pendingMessages, msg] })),
  removePendingMessage: (id) => set((state) => ({ pendingMessages: state.pendingMessages.filter((m) => m.id !== id) })),
}));