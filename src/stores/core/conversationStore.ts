import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  DareMessage, 
  BotConversationResponse,
  conversationService 
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
  
  // Bot context
  currentBotId: number | null;
  currentBot: Bot | null;
  
  // Available models
  availableModels: any[];
  
  // Conversation tracking
  conversationHistory: DareMessage[];
  lastMessageId: string | null;
  messageCount: number;
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
  
  // UI state
  setIsTyping: (isTyping: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  
  // Models
  loadAvailableModels: () => Promise<void>;
  
  // Conversation management
  deleteCurrentConversation: () => Promise<void>;
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
    currentBotId: null,
    currentBot: null,
    availableModels: [],
    conversationHistory: [],
    lastMessageId: null,
    messageCount: 0,

    // Actions
    setActiveBot: async (bot: Bot) => {
      try {
        const botId = bot.id;
        console.log('Setting active bot:', botId, bot.title);
        
        // Set the bot directly
        set({ 
          currentBotId: botId, 
          currentBot: bot,
          messages: [],
          conversationHistory: [],
          messageCount: 0,
          lastMessageId: null
        });
        
        // Get or create conversation
        console.log('Getting or creating conversation for bot:', botId);
        const conversation = await conversationService.getOrCreateBotConversation(botId);
        console.log('Conversation created/retrieved:', conversation.dareConversationId);
        set({ activeConversation: conversation });
        
        // Connect WebSocket through WebSocket store
        const websocketStore = useWebSocketStore.getState();
        const authToken = localStorage.getItem('access_token');
        if (!authToken) {
          throw new Error('No authentication token found');
        }

        const DARE_WEBSOCKET_URL = 'ws://localhost:8000';
        const socketUrl = `${DARE_WEBSOCKET_URL}/ws/conversations/${conversation.dareConversationId}/?jwt_key=${encodeURIComponent(authToken)}`;
        
        console.log('Connecting to WebSocket:', socketUrl);
        await websocketStore.connect(socketUrl);
        console.log('WebSocket connected successfully');
        
      } catch (error) {
        console.error('Error setting active bot:', error);
        set({ 
          currentBotId: null,
          currentBot: null,
          activeConversation: null
        });
      }
    },

    clearActiveConversation: () => {
      // Disconnect WebSocket
      const websocketStore = useWebSocketStore.getState();
      websocketStore.disconnect();
      
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
      
      console.log('Sending message:', message);
      console.log('Active conversation:', activeConversation?.dareConversationId);
      console.log('WebSocket connected:', websocketStore.isConnected);
      
      if (!activeConversation || !websocketStore.isConnected) {
        console.error('Cannot send message: no active conversation or WebSocket connection');
        return;
      }

      try {
        // Clear input and set typing state atomically
        set({ inputMessage: '', isTyping: true });

        const payload: any = {
          message: message,
          enable_progress: true,
        };

        if (currentBot) {
          console.log('Adding bot configuration to payload:', {
            llm_id: currentBot.modelPreference?.chatModelDareId,
            file_ids: currentBot.dareFileIds,
            tracking_prompt: currentBot.prompts?.trackingPrompt ? 'present' : 'missing',
            learning_goals: currentBot.prompts?.learningGoals ? 'present' : 'missing',
            progress_llm_id: currentBot.modelPreference?.trackingModelDareId,
          });
          
          payload.llm_id = currentBot.modelPreference?.chatModelDareId;
          payload.file_ids = currentBot.dareFileIds || [];
          payload.tracking_prompt = currentBot.prompts?.trackingPrompt;
          payload.learning_goals = currentBot.prompts?.learningGoals;
          payload.progress_llm_id = currentBot.modelPreference?.trackingModelDareId;
          payload.bot_meta = {
            title: currentBot.title,
            subject: currentBot.subject,
            topic: currentBot.topic,
          };
        }

        console.log('Sending WebSocket payload:', payload);
        websocketStore.sendMessage(payload);

      } catch (error) {
        console.error('Error sending message:', error);
        // Ensure typing state is cleared on error
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
            lastMessageId: message.id
          };
        } else {
          return { 
            messages: [...state.messages, message],
            messageCount: state.messageCount + 1,
            lastMessageId: message.id
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
            lastMessageId: messageId 
          };
        }
        return state;
      });
    },

    setInputMessage: (message: string) => {
      set({ inputMessage: message });
    },

    setConversationHistory: (messages: DareMessage[]) => {
      console.log('Setting conversation history:', messages.length, 'messages');
      console.log('First few messages:', messages.slice(0, 3));
      set({ 
        conversationHistory: messages,
        messages: messages,
        messageCount: messages.length,
        lastMessageId: messages.length > 0 ? messages[messages.length - 1].id : null
      });
      console.log('Conversation history set. Current state messages count:', get().messages.length);
    },

    updateConversationStats: () => {
      const { messages } = get();
      set({
        messageCount: messages.length,
        lastMessageId: messages.length > 0 ? messages[messages.length - 1].id : null
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
      } catch (error) {
        console.error('Error loading available models:', error);
      }
    },

    deleteCurrentConversation: async () => {
      const { activeConversation } = get();
      
      if (!activeConversation?.dareConversationId) {
        console.error('No active conversation to delete');
        return;
      }

      try {
        console.log('Deleting conversation:', activeConversation.dareConversationId);
        
        // Call the backend to delete the conversation from DARE
        const result = await conversationService.deleteConversation(activeConversation.dareConversationId);
        
        if (result.success) {
          console.log('Conversation deleted successfully:', result.message);
          
          // Clear the current conversation state
          set({
            activeConversation: null,
            messages: [],
            conversationHistory: [],
            messageCount: 0,
            lastMessageId: null,
            isLoadingMessages: false,
            isTyping: false
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
  }))
);

// Selector hooks for better performance
export const useActiveConversation = () => useConversationStore(state => state.activeConversation);
export const useMessages = () => useConversationStore(state => state.messages);
export const useIsTyping = () => useConversationStore(state => state.isTyping);
export const useInputMessage = () => useConversationStore(state => state.inputMessage);
export const useCurrentBot = () => useConversationStore(state => state.currentBot);
export const useConversationStats = () => useConversationStore(state => ({
  messageCount: state.messageCount,
  lastMessageId: state.lastMessageId,
  conversationHistory: state.conversationHistory
}));