import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  DareConversation, 
  DareMessage, 
  BotConversationResponse,
  conversationService 
} from '@/services/conversation.service';

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
  
  // Available models
  availableModels: any[];
}

export interface ConversationActions {
  // Conversation management
  setActiveBot: (botId: number) => Promise<void>;
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
    availableModels: [],

    // Actions
    setActiveBot: async (botId: number) => {
      try {
        set({ currentBotId: botId });
        
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
        inputMessage: '',
        websocket: initialWebSocketState,
      });
    },

    // Removed loadConversationHistory - WebSocket handles message history automatically

    sendMessage: async (message: string) => {
      const { activeConversation, websocket } = get();
      if (!activeConversation || !websocket.socket || !websocket.isConnected) {
        console.error('Cannot send message: no active conversation or WebSocket connection');
        return;
      }

      try {
        // Add user message immediately to UI
        const userMessage: DareMessage = {
          id: `temp-${Date.now()}`,
          message,
          senderType: 'USER',
          senderName: 'You',
          isSender: true,
          date: new Date().toISOString(),
          streaming: false,
        };

        get().addMessage(userMessage);
        set({ inputMessage: '', isTyping: true });

        // Send via WebSocket for real-time streaming
        websocket.socket.send(JSON.stringify({
          type: 'message',
          message: message,
          streaming: true
        }));

      } catch (error) {
        console.error('Error sending message:', error);
        set({ isTyping: false });
      }
    },

    addMessage: (message: DareMessage) => {
      set(state => ({
        messages: [...state.messages, message]
      }));
    },

    updateMessage: (messageId: string, updates: Partial<DareMessage>) => {
      set(state => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      }));
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
          console.log('WebSocket connected to DARE');
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
          console.log('WebSocket message:', data);

          switch (data.type) {
            case 'conversation_history':
              if (data.conversationHistory) {
                set({ messages: data.conversationHistory });
              }
              break;
              
            case 'message':
              if (data.regenerate) {
                // Update existing message
                get().updateMessage(data.messageId, {
                  message: data.message,
                  streaming: false,
                });
              } else {
                // Add new message
                get().addMessage({
                  id: data.messageId || `msg-${Date.now()}`,
                  message: data.message,
                  senderType: data.sender_type || 'ASSISTANT',
                  senderName: data.sender_name || 'Assistant',
                  isSender: false,
                  date: data.date || new Date().toISOString(),
                  streaming: data.streaming || false,
                  llmId: data.llm_id,
                  cost: data.cost,
                  inputTokens: data.input_tokens,
                  outputTokens: data.output_tokens,
                });
              }
              
              if (!data.streaming) {
                set({ isTyping: false });
              }
              break;
              
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
          console.log('WebSocket disconnected');
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