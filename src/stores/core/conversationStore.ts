import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import {
  BotConversationResponse,
  DareMessage,
  conversationService,
} from '@/services/conversation.service';

import type { Bot } from '@/types/bot';
import type { ChatToolCall } from '@/types/toolCalls';

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
  isProgressSidebarVisible: boolean;
  isProgressCollapsed: boolean;

  // Bot context
  currentBotId: number | null;
  currentBot: Bot | null;

  // Available models
  availableModels: unknown[];

  // Conversation tracking
  conversationHistory: DareMessage[];
  lastMessageId: string | null;
  messageCount: number;

  // Live tool-call activity for the in-flight turn, keyed by message id.
  // Historical messages carry their own toolCalls from the history payload.
  toolCallsByMessage: Record<string, ChatToolCall[]>;
}

export interface ConversationActions {
  // Conversation management
  setActiveBot: (bot: Bot) => Promise<void>;
  clearActiveConversation: () => void;

  // Message handling
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: DareMessage) => void;
  updateMessage: (messageId: string, updates: Partial<DareMessage>) => void;
  setInputMessage: (message: string) => void;

  // Conversation tracking
  updateConversationStats: () => void;
  setConversationHistory: (messages: DareMessage[]) => void;

  // Tool-call activity
  upsertToolCall: (messageId: string, toolCall: Partial<ChatToolCall>) => void;

  // UI state
  setIsTyping: (isTyping: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  setProgressSidebarVisible: (visible: boolean) => void;
  setProgressCollapsed: (collapsed: boolean) => void;

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
    isProgressSidebarVisible: true,
    isProgressCollapsed: false,
    currentBotId: null,
    currentBot: null,
    availableModels: [],
    conversationHistory: [],
    lastMessageId: null,
    messageCount: 0,
    toolCallsByMessage: {},

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

        // Unsubscribe from previous conversation (if any) but keep connection alive
        const { currentConversationId } = websocketStore;
        if (currentConversationId) {
          websocketStore.unsubscribeFromConversation(currentConversationId);
        }

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

        // Socket connection is now handled by ProtectedRoute via useSocketConnection hook
        // Here we only subscribe to the conversation room
        websocketStore.subscribeToConversation(conversation.dareConversationId);
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

    clearActiveConversation: () => {
      const websocketStore = useWebSocketStore.getState();

      // Unsubscribe from current conversation (but keep socket connection alive)
      const { currentConversationId } = websocketStore;
      if (currentConversationId) {
        websocketStore.unsubscribeFromConversation(currentConversationId);
      }

      // Clear progress tokens
      websocketStore.clearProgressTokens();

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
        get().addMessage({
          id: `pending-${crypto.randomUUID()}`,
          message,
          senderType: 'USER',
          senderName: '',
          isSender: true,
          date: new Date().toISOString(),
          streaming: false,
        });
        websocketStore.setError(null);

        const selectedModelId = currentBot?.modelPreference?.chatModelDareId;
        if (!selectedModelId) {
          websocketStore.setError(
            'This bot does not have an AI model selected. Please ask the bot owner to choose a model.'
          );
          set({ isTyping: false });
          return;
        }

        const payload: Record<string, unknown> = {
          message: message,
          enable_progress: true,
          is_advanced: Boolean(currentBot?.isAdvanced || false),
        };

        if (currentBot) {
          // LLM and context settings.
          //
          // `model_id` is the new opaque dispatch field on DARE's chat
          // socket (replaces the legacy `llm_id`); DARE inverts the
          // encoding via `parse_model_id` — so a stringified PK ("42") or
          // a LiteLLM handle ("litellm:<key>:<name>") both work.
          //
          // `progress_llm_id` is the SB-specific tracker field; DARE
          // accepts the same opaque-string contract on this one.
          payload.model_id = selectedModelId;
          payload.embedding_ids = currentBot.dareFileIds || [];
          payload.file_owner_id = currentBot.createdByDareId;
          payload.progress_llm_id = currentBot.modelPreference?.trackingModelDareId;
          payload.web_search_enabled = Boolean(currentBot.webSearchEnabled || false);
          // Retrieval strategy for DARE's shared tool loop; 'agentic' lets the
          // model call search_documents on demand (authenticated surface only —
          // DARE downgrades anonymous sessions server-side).
          payload.rag_mode = currentBot.ragMode || 'advanced';

          if (currentBot.maxContextSnippets !== undefined) {
            payload.max_context_snippets = currentBot.maxContextSnippets;
          }
          if (currentBot.documentSimilarityThreshold !== undefined) {
            payload.document_similarity_threshold = currentBot.documentSimilarityThreshold;
          }

          // All Socratic bot data goes in bot_meta (single source of truth)
          payload.bot_meta = {
            title: currentBot.title,
            subject: currentBot.subject,
            topic: currentBot.topic,
            chat_prompt: currentBot.prompts?.chatPrompt,
            tracking_prompt: currentBot.prompts?.trackingPrompt,
            learning_goals: currentBot.prompts?.learningGoals,
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
            lastMessageId: updates.id ?? messageId,
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
        // History messages carry persisted toolCalls; drop the live buffer
        toolCallsByMessage: {},
      });
    },

    upsertToolCall: (messageId: string, toolCall: Partial<ChatToolCall>) => {
      if (!toolCall.toolCallId) return;
      set(state => {
        const key = String(messageId);
        const existing = state.toolCallsByMessage[key] || [];
        const index = existing.findIndex(tc => tc.toolCallId === toolCall.toolCallId);
        const next =
          index === -1
            ? [...existing, toolCall as ChatToolCall]
            : existing.map((tc, i) => (i === index ? { ...tc, ...toolCall } : tc));
        return { toolCallsByMessage: { ...state.toolCallsByMessage, [key]: next } };
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

    setProgressSidebarVisible: (visible: boolean) => {
      set({ isProgressSidebarVisible: visible });
    },

    setProgressCollapsed: (collapsed: boolean) => {
      set({ isProgressCollapsed: collapsed });
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
          // Clear the current conversation state (keep socket connected)
          set({
            activeConversation: null,
            messages: [],
            conversationHistory: [],
            messageCount: 0,
            lastMessageId: null,
            isLoadingMessages: false,
            isTyping: false,
          });

          // Just clear progress tokens, don't disconnect the socket
          const wsStore = useWebSocketStore.getState();
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
