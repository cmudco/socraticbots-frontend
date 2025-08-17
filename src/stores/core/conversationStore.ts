import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  DareMessage, 
  BotConversationResponse,
  conversationService 
} from '@/services/conversation.service';
import type { Bot } from '@/types/bot';

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  socket: WebSocket | null;
}

export interface ConversationState {
  // Current active conversation
  activeConversation: BotConversationResponse | null;
  
  // Messages
  messages: DareMessage[];
  isLoadingMessages: boolean;
  
  // WebSocket state
  websocket: WebSocketState;
  
  // UI state
  isTyping: boolean;
  inputMessage: string;
  
  // Bot context
  currentBotId: number | null;
  currentBot: Bot | null;
  
  // Available models
  availableModels: any[];
}

export interface ConversationActions {
  // Conversation management - simplified to only work with full bot objects
  setActiveBot: (bot: Bot) => Promise<void>;
  clearActiveConversation: () => void;
  
  // Message handling
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: DareMessage) => void;
  updateMessage: (messageId: string, updates: Partial<DareMessage>) => void;
  setInputMessage: (message: string) => void;
  
  // WebSocket management
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  setWebSocketError: (error: string | null) => void;
  
  // UI state
  setIsTyping: (isTyping: boolean) => void;
  
  // Models
  loadAvailableModels: () => Promise<void>;
}

type ConversationStore = ConversationState & ConversationActions;

const initialWebSocketState: WebSocketState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  socket: null,
};

export const useConversationStore = create<ConversationStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    activeConversation: null,
    messages: [],
    isLoadingMessages: false,
    websocket: initialWebSocketState,
    isTyping: false,
    inputMessage: '',
    currentBotId: null,
    currentBot: null,
    availableModels: [],

    // Actions
    setActiveBot: async (bot: Bot) => {
      try {
        // Extract bot ID from the object
        const botId = bot.id;
        
        // Set the bot directly - no more lookup needed!
        set({ currentBotId: botId, currentBot: bot });
        
        // Get or create conversation using bot_id + user_id deterministic approach
        const conversation = await conversationService.getOrCreateBotConversation(botId);
        
        set({ 
          activeConversation: conversation,
          messages: [] // Will be loaded via WebSocket
        });
        
        // Connect WebSocket - it will load history automatically
        await get().connectWebSocket();
        
      } catch (error) {
        console.error('Error setting active bot:', error);
        set({ websocket: { ...get().websocket, error: error instanceof Error ? error.message : 'Unknown error' } });
      }
    },

    clearActiveConversation: () => {
      get().disconnectWebSocket();
      set({
        activeConversation: null,
        messages: [],
        currentBotId: null,
        currentBot: null,
        inputMessage: '',
        websocket: initialWebSocketState,
      });
    },

    // Removed loadConversationHistory - WebSocket handles message history automatically

    sendMessage: async (message: string) => {
      const { activeConversation, websocket, currentBot } = get();
      if (!activeConversation || !websocket.socket || !websocket.isConnected) {
        console.error('Cannot send message: no active conversation or WebSocket connection');
        return;
      }

      try {
        // Clear input and set typing state
        set({ inputMessage: '', isTyping: true });

        // Build Socratic FE payload additions
        const payload: any = {
          message: message,
          enable_progress: true, // platform-gated server-side; explicit opt-in too
        };

        if (currentBot) {
          // We always have complete Bot objects now!
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
        } else {
          // Fallback if no bot is selected
          payload.bot_meta = {
            title: '',
            subject: '',
            topic: '',
          };
        }

        // Send via WebSocket for real-time streaming
        websocket.socket.send(JSON.stringify(payload));

      } catch (error) {
        console.error('Error sending message:', error);
        set({ isTyping: false });
      }
    },

    addMessage: (message: DareMessage) => {
      set(state => {
        // Check if message already exists (like DARE does)
        const index = state.messages.findIndex(msg => msg.id === message.id);
        if (index !== -1) {
          // Replace existing message
          const newMessages = [...state.messages];
          newMessages[index] = message;
          return { messages: newMessages };
        } else {
          // Add new message
          return { messages: [...state.messages, message] };
        }
      });
    },

    updateMessage: (messageId: string, updates: Partial<DareMessage>) => {
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

    setInputMessage: (message: string) => {
      set({ inputMessage: message });
    },

    connectWebSocket: async () => {
      const { activeConversation, websocket } = get();
      if (!activeConversation || websocket.isConnecting || websocket.isConnected) return;

      try {
        set({ websocket: { ...websocket, isConnecting: true, error: null } });

        // Get auth token
        const authToken = localStorage.getItem('access_token');
        if (!authToken) {
          throw new Error('No authentication token found');
        }

        // DARE WebSocket URL - direct connection to DARE backend
        const DARE_WEBSOCKET_URL = 'ws://localhost:8000'; // DARE backend WebSocket
        const socketUrl = `${DARE_WEBSOCKET_URL}/ws/conversations/${activeConversation.dareConversationId}/?jwt_key=${encodeURIComponent(authToken)}`;

        const socket = new WebSocket(socketUrl);

        socket.onopen = () => {
          set({ 
            websocket: { 
              ...get().websocket, 
              isConnected: true, 
              isConnecting: false, 
              socket 
            } 
          });
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'conversation_history':
              if (data.conversationHistory) {
                // Map senderType from numbers to strings for all messages
                const mappedMessages = data.conversationHistory.map((msg: any) => ({
                  ...msg,
                  senderType: msg.senderType === 1 ? 'USER' : 'ASSISTANT'
                }));
                set({ messages: mappedMessages });
              }
              break;
              
            case 'message':
              // Map senderType from number to string  
              const senderType = data.senderType === 1 ? 'USER' : 'ASSISTANT';
              
              if (data.regenerate) {
                // Update existing message (regeneration)
                get().updateMessage(data.id, {
                  ...data,
                  senderType,
                  streaming: false,
                });
              } else {
                // Add message (DARE pattern - addMessage handles existing vs new)
                get().addMessage({
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
                set({ isTyping: false });
              }
              break;

            case 'ai_stream':
              // Update streaming AI message content (DARE pattern)
              get().updateMessage(data.id, {
                message: data.message,
              });
              break;

            case 'progress_stream': {
              // Update progress tokens in chatStore
              import('@/stores/core/chatStore').then(({ useChatStore }) => {
                const store = useChatStore.getState();
                store.setProgressStreaming(true);
                if (data.chunk) store.addProgressToken(data.chunk);
              });
              break;
            }

            case 'progress_complete': {
              import('@/stores/core/chatStore').then(({ useChatStore }) => {
                const store = useChatStore.getState();
                store.setProgressStreaming(false);
              });
              break;
            }

            case 'progress_error': {
              import('@/stores/core/chatStore').then(({ useChatStore }) => {
                const store = useChatStore.getState();
                store.setProgressStreaming(false);
              });
              break;
            }
              
            case 'error':
              console.error('WebSocket error:', data.message);
              set({ 
                websocket: { ...get().websocket, error: data.message },
                isTyping: false 
              });
              break;
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          set({ 
            websocket: { 
              ...get().websocket, 
              error: 'WebSocket connection error',
              isConnecting: false 
            } 
          });
        };

        socket.onclose = () => {
          set({ 
            websocket: { 
              ...get().websocket, 
              isConnected: false, 
              isConnecting: false,
              socket: null 
            } 
          });
        };

      } catch (error) {
        console.error('Error connecting WebSocket:', error);
        set({ 
          websocket: { 
            ...get().websocket, 
            error: error instanceof Error ? error.message : 'Unknown error',
            isConnecting: false 
          } 
        });
      }
    },

    disconnectWebSocket: () => {
      const { websocket } = get();
      if (websocket.socket) {
        websocket.socket.close();
      }
      set({ websocket: initialWebSocketState });
    },

    setWebSocketError: (error: string | null) => {
      set({ websocket: { ...get().websocket, error } });
    },

    setIsTyping: (isTyping: boolean) => {
      set({ isTyping });
    },

    loadAvailableModels: async () => {
      try {
        const models = await conversationService.getAvailableModels();
        set({ availableModels: models });
      } catch (error) {
        console.error('Error loading available models:', error);
      }
    },
  }))
);

// Selector hooks for better performance
export const useActiveConversation = () => useConversationStore(state => state.activeConversation);
export const useMessages = () => useConversationStore(state => state.messages);
export const useWebSocketState = () => useConversationStore(state => state.websocket);
export const useIsTyping = () => useConversationStore(state => state.isTyping);
export const useInputMessage = () => useConversationStore(state => state.inputMessage);
export const useCurrentBot = () => useConversationStore(state => state.currentBot);