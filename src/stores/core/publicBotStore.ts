import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { PublicBotConversation, PublicBotInfo, PublicBotMessage } from '@/types/publicBot';

export interface PublicBotState {
  // Bot information
  botInfo: PublicBotInfo | null;

  // Conversation
  activeConversation: PublicBotConversation | null;

  // Messages
  messages: PublicBotMessage[];

  // Session
  anonymousSessionId: string | null;

  // UI state
  isTyping: boolean;
  inputMessage: string;
  isLoadingBot: boolean;
  isLoadingMessages: boolean;
}

export interface PublicBotActions {
  // Bot management
  setBotInfo: (botInfo: PublicBotInfo) => void;
  setActiveConversation: (conversation: PublicBotConversation) => void;
  setAnonymousSessionId: (sessionId: string) => void;

  // Message handling
  addMessage: (message: PublicBotMessage) => void;
  updateMessage: (messageId: string, updates: Partial<PublicBotMessage>) => void;
  setMessages: (messages: PublicBotMessage[]) => void;
  setInputMessage: (message: string) => void;

  // UI state
  setIsTyping: (isTyping: boolean) => void;
  setLoadingBot: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

type PublicBotStore = PublicBotState & PublicBotActions;

const initialState: PublicBotState = {
  botInfo: null,
  activeConversation: null,
  messages: [],
  anonymousSessionId: null,
  isTyping: false,
  inputMessage: '',
  isLoadingBot: false,
  isLoadingMessages: false,
};

export const usePublicBotStore = create<PublicBotStore>()(
  subscribeWithSelector(set => ({
    ...initialState,

    // Bot management
    setBotInfo: (botInfo: PublicBotInfo) => {
      set({ botInfo });
    },

    setActiveConversation: (conversation: PublicBotConversation) => {
      set({ activeConversation: conversation });
    },

    setAnonymousSessionId: (sessionId: string) => {
      set({ anonymousSessionId: sessionId });
    },

    // Message handling
    addMessage: (message: PublicBotMessage) => {
      set(state => {
        const index = state.messages.findIndex(msg => msg.id === message.id);
        if (index !== -1) {
          // Update existing message
          const newMessages = [...state.messages];
          newMessages[index] = message;
          return { messages: newMessages };
        } else {
          // Add new message
          return { messages: [...state.messages, message] };
        }
      });
    },

    updateMessage: (messageId: string, updates: Partial<PublicBotMessage>) => {
      set(state => {
        const index = state.messages.findIndex(msg => msg.id === messageId);
        if (index !== -1) {
          const newMessages = [...state.messages];
          newMessages[index] = { ...newMessages[index], ...updates };
          return { messages: newMessages };
        }
        return state;
      });
    },

    setMessages: (messages: PublicBotMessage[]) => {
      set({ messages });
    },

    setInputMessage: (message: string) => {
      set({ inputMessage: message });
    },

    // UI state
    setIsTyping: (isTyping: boolean) => {
      set({ isTyping });
    },

    setLoadingBot: (loading: boolean) => {
      set({ isLoadingBot: loading });
    },

    setLoadingMessages: (loading: boolean) => {
      set({ isLoadingMessages: loading });
    },

    // Reset
    reset: () => {
      set(initialState);
    },
  }))
);

// Selector hooks for better performance
export const useBotInfo = () => usePublicBotStore(state => state.botInfo);
export const useActivePublicConversation = () =>
  usePublicBotStore(state => state.activeConversation);
export const usePublicMessages = () => usePublicBotStore(state => state.messages);
export const useAnonymousSessionId = () => usePublicBotStore(state => state.anonymousSessionId);
export const usePublicIsTyping = () => usePublicBotStore(state => state.isTyping);
export const usePublicInputMessage = () => usePublicBotStore(state => state.inputMessage);
export const useIsLoadingPublicBot = () => usePublicBotStore(state => state.isLoadingBot);
