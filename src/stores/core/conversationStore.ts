import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import {
  BotConversationResponse,
  DareMessage,
  conversationService,
} from '@/services/conversation.service';

import type { Bot } from '@/types/bot';

import { useWebSocketStore } from './websocketStore';

export interface ConversationState {
  // Current active conversation
  activeConversation: BotConversationResponse | null;

  // Messages
  messages: DareMessage[];
  isLoadingMessages: boolean;

  // UI state
  isTyping: boolean;
  inputMessage: string;
  isLoadingBot: boolean;

  // Bot context
  currentBotId: number | null;
  currentBot: Bot | null;

  // Available models
  availableModels: unknown[];

  // Conversation tracking
  conversationHistory: DareMessage[];
  lastMessageId: string | null;
  messageCount: number;
}

export interface ConversationActions {
  // Conversation management
  setActiveBot: (bot: Bot) => Promise<void>;
  clearActiveConversation: () => Promise<void>;

  // Message handling
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: DareMessage) => void;
  updateMessage: (messageId: string, updates: Partial<DareMessage>) => void;
  setInputMessage: (message: string) => void;

  // Conversation tracking
  updateConversationStats: () => void;
  setConversationHistory: (messages: DareMessage[]) => void;

  // UI state
  setIsTyping: (isTyping: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;

  // Models
  loadAvailableModels: () => Promise<void>;

  // Conversation management
  deleteCurrentConversation: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

type ConversationStore = ConversationState & ConversationActions;

export const useConversationStore = create<ConversationStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    activeConversation: null,
    messages: [],
    isLoadingMessages: false,
    isTyping: false,
    inputMessage: '',
    isLoadingBot: false,
    currentBotId: null,
    currentBot: null,
    availableModels: [],
    conversationHistory: [],
    lastMessageId: null,
    messageCount: 0,

    // Actions
    setActiveBot: async (bot: Bot) => {
      const { isLoadingBot } = get();
      
      if (isLoadingBot) {
        return;
      }

      try {
        const botId = bot.id;
        set({ isLoadingBot: true });

        const websocketStore = useWebSocketStore.getState();
        await websocketStore.disconnect();

        set({
          currentBotId: botId,
          currentBot: bot,
          messages: [],
          conversationHistory: [],
          messageCount: 0,
          lastMessageId: null,
        });

        const conversation = await conversationService.getOrCreateBotConversation(botId);
        set({ activeConversation: conversation });

        const authToken = localStorage.getItem('access_token');
        if (!authToken) {
          throw new Error('No authentication token found');
        }

        const DARE_WEBSOCKET_URL = import.meta.env.VITE_DARE_WEBSOCKET_URL;
        const socketUrl = `${DARE_WEBSOCKET_URL}/conversations/${conversation.dareConversationId}/?jwt_key=${encodeURIComponent(authToken)}`;

        await websocketStore.connect(socketUrl);
      } catch (error) {
        console.error('Error setting active bot:', error);
        set({
          currentBotId: null,
          currentBot: null,
          activeConversation: null,
        });
      } finally {
        set({ isLoadingBot: false });
      }
    },

    clearActiveConversation: async () => {
      // Disconnect WebSocket
      const websocketStore = useWebSocketStore.getState();
      await websocketStore.disconnect();

      set({
        activeConversation: null,
        messages: [],
        currentBotId: null,
        currentBot: null,
        inputMessage: '',
        conversationHistory: [],
        lastMessageId: null,
        messageCount: 0,
        isTyping: false,
        isLoadingMessages: false,
      });
    },

    sendMessage: async (message: string) => {
      const { activeConversation, currentBot } = get();
      const websocketStore = useWebSocketStore.getState();

      if (!activeConversation || !websocketStore.isConnected) {
        console.error('Cannot send message: no active conversation or WebSocket connection');
        return;
      }

      try {
        set({ inputMessage: '', isTyping: true });

        const payload: Record<string, unknown> = {
          message: message,
          enable_progress: true,
          is_advanced: Boolean(currentBot?.isAdvanced || false),
        };

        if (currentBot) {
          payload.llm_id = currentBot.modelPreference?.chatModelDareId;
          payload.file_ids = currentBot.dareFileIds || [];
          payload.tracking_prompt = currentBot.prompts?.trackingPrompt;
          payload.learning_goals = currentBot.prompts?.learningGoals;
          payload.progress_llm_id = currentBot.modelPreference?.trackingModelDareId;
          payload.bot_meta = {
            title: currentBot.title,
            subject: currentBot.subject,
            topic: currentBot.topic,
            learning_goals: currentBot.prompts?.learningGoals,
            chat_prompt: currentBot.prompts?.chatPrompt,
          };
        }

        websocketStore.sendMessage(payload);
      } catch {
        set({ isTyping: false });
      }
    },

    addMessage: (message: DareMessage) => {
      set(state => {
        const index = state.messages.findIndex(msg => msg.id === message.id);
        if (index !== -1) {
          const newMessages = [...state.messages];
          newMessages[index] = message;
          return {
            messages: newMessages,
            lastMessageId: message.id,
          };
        } else {
          return {
            messages: [...state.messages, message],
            messageCount: state.messageCount + 1,
            lastMessageId: message.id,
          };
        }
      });
      get().updateConversationStats();
    },

    updateMessage: (messageId: string, updates: Partial<DareMessage>) => {
      set(state => {
        const index = state.messages.findIndex(msg => msg.id === messageId);
        if (index !== -1) {
          const newMessages = [...state.messages];
          newMessages[index] = { ...newMessages[index], ...updates };
          return {
            messages: newMessages,
            lastMessageId: messageId,
          };
        }
        return state;
      });
    },

    setInputMessage: (message: string) => {
      set({ inputMessage: message });
    },

    setConversationHistory: (messages: DareMessage[]) => {
      set({
        conversationHistory: messages,
        messages: messages,
        messageCount: messages.length,
        lastMessageId: messages.length > 0 ? messages[messages.length - 1].id : null,
      });
    },

    updateConversationStats: () => {
      const { messages } = get();
      set({
        messageCount: messages.length,
        lastMessageId: messages.length > 0 ? messages[messages.length - 1].id : null,
      });
    },

    setIsTyping: (isTyping: boolean) => {
      set({ isTyping });
    },

    setLoadingMessages: (loading: boolean) => {
      set({ isLoadingMessages: loading });
    },

    loadAvailableModels: async () => {
      try {
        const models = await conversationService.getAvailableModels();
        set({ availableModels: models });
      } catch {
        console.error('Error loading available models');
      }
    },

    deleteCurrentConversation: async () => {
      const { activeConversation } = get();

      if (!activeConversation?.dareConversationId) {
        console.error('No active conversation to delete');
        return;
      }

      try {
        const result = await conversationService.deleteConversation(
          activeConversation.dareConversationId
        );

        if (result.success) {
          // Clear the current conversation state
          set({
            activeConversation: null,
            messages: [],
            conversationHistory: [],
            messageCount: 0,
            lastMessageId: null,
            isLoadingMessages: false,
            isTyping: false,
          });

          // Disconnect WebSocket
          const wsStore = useWebSocketStore.getState();
          wsStore.disconnect();
          wsStore.clearProgressTokens();
        } else {
          console.error('Failed to delete conversation:', result.message);
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        throw error;
      }
    },

    deleteMessage: async (messageId: string) => {
      const { activeConversation } = get();

      if (!activeConversation?.dareConversationId) {
        console.error('No active conversation to delete message from');
        return;
      }

      try {
        const result = await conversationService.deleteMessage(messageId);

        if (result.success) {
          set(state => ({
            messages: state.messages.filter(msg => msg.id !== messageId),
            messageCount: state.messageCount - 1,
            lastMessageId:
              state.messages.length > 1 ? state.messages[state.messages.length - 2]?.id : null,
          }));
        } else {
          console.error('Failed to delete message:', result.message);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
      }
    },
  }))
);

// Selector hooks for better performance
export const useActiveConversation = () => useConversationStore(state => state.activeConversation);
export const useMessages = () => useConversationStore(state => state.messages);
export const useIsTyping = () => useConversationStore(state => state.isTyping);
export const useInputMessage = () => useConversationStore(state => state.inputMessage);
export const useIsLoadingBot = () => useConversationStore(state => state.isLoadingBot);
export const useCurrentBot = () => useConversationStore(state => state.currentBot);
export const useConversationStats = () =>
  useConversationStore(state => ({
    messageCount: state.messageCount,
    lastMessageId: state.lastMessageId,
    conversationHistory: state.conversationHistory,
  }));
