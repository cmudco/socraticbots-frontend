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
  
  // WebSocket setup (internal)
  setupWebSocketMessageHandler: () => void;
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
        const conversation = await conversationService.getOrCreateBotConversation(botId);
        set({ activeConversation: conversation });
        
        // Connect WebSocket through WebSocket store
        const websocketStore = useWebSocketStore.getState();
        const authToken = localStorage.getItem('access_token');
        if (!authToken) {
          throw new Error('No authentication token found');
        }

        const DARE_WEBSOCKET_URL = 'ws://localhost:8000';
        const socketUrl = `${DARE_WEBSOCKET_URL}/ws/conversations/${conversation.dareConversationId}/?jwt_key=${encodeURIComponent(authToken)}`;
        
        await websocketStore.connect(socketUrl);
        
        // Set up WebSocket message handler
        get().setupWebSocketMessageHandler();
        
      } catch (error) {
        console.error('Error setting active bot:', error);
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
      
      if (!activeConversation || !websocketStore.isConnected) {
        console.error('Cannot send message: no active conversation or WebSocket connection');
        return;
      }

      try {
        set({ inputMessage: '', isTyping: true });

        const payload: any = {
          message: message,
          enable_progress: true,
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
          };
        }

        websocketStore.sendMessage(payload);

      } catch (error) {
        console.error('Error sending message:', error);
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
      set({ 
        conversationHistory: messages,
        messages: messages,
        messageCount: messages.length,
        lastMessageId: messages.length > 0 ? messages[messages.length - 1].id : null
      });
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

    // Setup WebSocket message handler (private method)
    setupWebSocketMessageHandler: () => {
      const websocketStore = useWebSocketStore.getState();
      const { socket } = websocketStore;
      
      if (!socket) return;

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const conversationState = get();

        switch (data.type) {
          case 'conversation_history':
            if (data.conversationHistory) {
              const mappedMessages = data.conversationHistory.map((msg: any) => ({
                ...msg,
                senderType: msg.senderType === 1 ? 'USER' : 'ASSISTANT'
              }));
              conversationState.setConversationHistory(mappedMessages);
            }
            break;
            
          case 'message':
            const senderType = data.senderType === 1 ? 'USER' : 'ASSISTANT';
            
            if (data.regenerate) {
              conversationState.updateMessage(data.id, {
                ...data,
                senderType,
                streaming: false,
              });
            } else {
              conversationState.addMessage({
                id: data.id,
                message: data.message,
                senderType,
                senderName: data.senderName,
                isSender: data.isSender,
                date: data.date,
                streaming: data.streaming,
                llmId: data.llmId,
                cost: data.cost,
                inputTokens: data.inputTokens,
                outputTokens: data.outputTokens,
                feedbackType: data.feedbackType,
                feedbackText: data.feedbackText,
                isEdited: data.isEdited,
                isRegenerated: data.isRegenerated,
                originalMessage: data.originalMessage
              });
            }
            
            if (!data.streaming) {
              conversationState.setIsTyping(false);
            }
            break;

          case 'ai_stream':
            conversationState.updateMessage(data.id, {
              message: data.message,
            });
            break;

          case 'progress_stream':
            websocketStore.setProgressStreaming(true);
            if (data.chunk) {
              websocketStore.addProgressToken(data.chunk);
            }
            break;

          case 'progress_complete':
            websocketStore.setProgressStreaming(false);
            break;

          case 'progress_error':
            websocketStore.setProgressStreaming(false);
            break;
            
          case 'error':
            console.error('WebSocket error:', data.message);
            websocketStore.setError(data.message);
            conversationState.setIsTyping(false);
            break;
        }
      };
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