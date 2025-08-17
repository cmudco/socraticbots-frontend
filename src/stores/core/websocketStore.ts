import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { scrollManager } from '@/utils/scrollManager';

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  socket: WebSocket | null;
  
  // Progress streaming state
  isProgressStreaming: boolean;
  progressTokens: string[];
  progressContent: string;
}

export interface WebSocketActions {
  // Connection management
  connect: (socketUrl: string) => Promise<void>;
  disconnect: () => void;
  setError: (error: string | null) => void;
  
  // Message handling
  handleWebSocketMessage: (data: any) => void;
  
  // Progress streaming actions
  setProgressStreaming: (streaming: boolean) => void;
  addProgressToken: (token: string) => void;
  clearProgressTokens: () => void;
  setProgressContent: (content: string) => void;
  
  // Message sending
  sendMessage: (payload: any) => void;
}

type WebSocketStore = WebSocketState & WebSocketActions;

const initialState: WebSocketState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  socket: null,
  isProgressStreaming: false,
  progressTokens: [],
  progressContent: '',
};

export const useWebSocketStore = create<WebSocketStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    connect: async (socketUrl: string) => {
      const { isConnecting, isConnected } = get();
      if (isConnecting || isConnected) {
        console.log('WebSocket already connecting or connected, skipping...');
        return;
      }

      return new Promise<void>((resolve, reject) => {
        try {
          console.log('Connecting to WebSocket:', socketUrl);
          set({ isConnecting: true, error: null });

          const socket = new WebSocket(socketUrl);

          socket.onopen = () => {
            console.log('WebSocket connected successfully');
            set({ 
              isConnected: true, 
              isConnecting: false, 
              socket,
              error: null
            });
            resolve();
          };

          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log('WebSocket message received:', data.type, data);
              
              // Handle different message types and update appropriate stores
              get().handleWebSocketMessage(data);
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };

          socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            set({ 
              error: 'WebSocket connection error',
              isConnecting: false,
              isConnected: false
            });
            reject(new Error('WebSocket connection error'));
          };

          socket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            set({ 
              isConnected: false, 
              isConnecting: false,
              socket: null
            });
          };

          // Note: onmessage will be handled by the conversation store
          // which will subscribe to WebSocket events and route them appropriately

        } catch (error) {
          console.error('Error connecting WebSocket:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            isConnecting: false 
          });
          reject(error);
        }
      });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.close();
      }
      set(initialState);
    },

    setError: (error: string | null) => {
      set({ error });
    },

    handleWebSocketMessage: (data: any) => {
      // Import the conversation store dynamically to avoid circular imports
      import('./conversationStore').then(({ useConversationStore }) => {
        const conversationStore = useConversationStore.getState();
        
        switch (data.type) {
          case 'conversation_history':
            console.log('Processing conversation_history:', data.conversationHistory?.length, 'messages');
            console.log('Raw conversation history data:', data.conversationHistory);
            if (data.conversationHistory) {
              const mappedMessages = data.conversationHistory.map((msg: any) => ({
                ...msg,
                senderType: msg.senderType === 1 ? 'USER' : 'ASSISTANT'
              }));
              console.log('Mapped messages for conversation history:', mappedMessages);
              conversationStore.setConversationHistory(mappedMessages);
              
              // Also verify the state was updated
              setTimeout(() => {
                const currentMessages = useConversationStore.getState().messages;
                console.log('Messages in store after setConversationHistory:', currentMessages.length);
              }, 100);
            }
            break;
            
          case 'message':
            console.log('Processing message:', data.id, 'streaming:', data.streaming);
            const senderType = data.senderType === 1 ? 'USER' : 'ASSISTANT';
            
            if (data.regenerate) {
              conversationStore.updateMessage(data.id, {
                ...data,
                senderType,
                streaming: false,
              });
            } else {
              conversationStore.addMessage({
                id: data.id,
                message: data.message || '',
                senderType,
                senderName: data.senderName || '',
                isSender: data.isSender || false,
                date: data.date || new Date().toISOString(),
                streaming: data.streaming || false,
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
            
            // Clear typing state when message is not streaming
            if (!data.streaming) {
              conversationStore.setIsTyping(false);
            }
            break;
            
          case 'ai_stream':
            console.log('Processing ai_stream for message:', data.id, 'streaming:', data.streaming);
            const assistantSenderType = data.senderType === 1 ? 'USER' : 'ASSISTANT';
            
            if (data.regenerate) {
              conversationStore.updateMessage(data.id, {
                ...data,
                senderType: assistantSenderType,
                streaming: data.streaming,
              });
            } else {
              // Check if message already exists, if not create it
              const existingMessage = conversationStore.messages.find(m => m.id === data.id);
              if (existingMessage) {
                // Update existing message with streaming content
                conversationStore.updateMessage(data.id, {
                  message: data.message || '',
                  streaming: data.streaming,
                });
              } else {
                // Create new message
                conversationStore.addMessage({
                  id: data.id,
                  message: data.message || '',
                  senderType: assistantSenderType,
                  senderName: data.senderName || 'AI Assistant',
                  isSender: data.isSender || false,
                  date: data.date || new Date().toISOString(),
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
            }
            
            // Trigger scroll for streaming messages to keep latest content visible
            if (data.streaming && data.senderType !== 1) {
              scrollManager.triggerScroll();
            }
            
            // Clear typing state when streaming ends
            if (!data.streaming) {
              conversationStore.setIsTyping(false);
            }
            break;
            
          case 'stream_chunk':
            console.log('Processing stream_chunk for message:', data.messageId, 'chunk:', data.chunk);
            // Find current message and append the chunk
            const currentMessage = conversationStore.messages.find(m => m.id === data.messageId);
            if (currentMessage) {
              conversationStore.updateMessage(data.messageId, { 
                message: (currentMessage.message || '') + (data.chunk || ''),
                streaming: true 
              });
            }
            break;
            
          case 'stream_end':
            console.log('Processing stream_end for message:', data.messageId);
            conversationStore.updateMessage(data.messageId, { 
              streaming: false 
            });
            // Clear typing state when streaming ends
            conversationStore.setIsTyping(false);
            break;
            
          case 'progress_start':
            console.log('Progress streaming started');
            set({ isProgressStreaming: true });
            get().clearProgressTokens();
            break;
            
          case 'progress_token':
            console.log('Progress token received:', data.token);
            get().addProgressToken(data.token);
            break;
            
          case 'progress_stream':
            console.log('Processing progress_stream:', data.chunk);
            set({ isProgressStreaming: true });
            if (data.chunk) {
              get().addProgressToken(data.chunk);
            }
            break;

          case 'progress_complete':
            console.log('Processing progress_complete');
            set({ isProgressStreaming: false });
            break;

          case 'progress_error':
            console.log('Processing progress_error:', data.message);
            set({ isProgressStreaming: false });
            break;
            
          case 'progress_end':
            console.log('Progress streaming ended');
            set({ isProgressStreaming: false });
            break;

          case 'latest_progress':
            console.log('Processing latest_progress assessment:', data.assessment);
            // Handle assessment data by setting it as progress content
            if (data.assessment && data.assessment.content) {
              set({ 
                progressContent: data.assessment.content,
                isProgressStreaming: false,
                progressTokens: [data.assessment.content]
              });
            }
            break;
            
          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
      }).catch(error => {
        console.error('Error handling WebSocket message:', error);
      });
    },

    setProgressStreaming: (streaming: boolean) => {
      set({ isProgressStreaming: streaming });
      if (!streaming) {
        // Compile final content from tokens when streaming ends
        const { progressTokens } = get();
        set({ progressContent: progressTokens.join('') });
      }
    },

    addProgressToken: (token: string) => {
      set(state => ({ 
        progressTokens: [...state.progressTokens, token] 
      }));
    },

    clearProgressTokens: () => {
      set({ 
        progressTokens: [], 
        progressContent: '',
        isProgressStreaming: false 
      });
    },

    setProgressContent: (content: string) => {
      set({ progressContent: content });
    },

    sendMessage: (payload: any) => {
      const { socket, isConnected } = get();
      if (!socket || !isConnected) {
        console.error('Cannot send message: WebSocket not connected');
        return;
      }
      
      try {
        socket.send(JSON.stringify(payload));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        set({ error: 'Failed to send message' });
      }
    },
  }))
);

// Selector hooks for better performance - use individual selectors to avoid object recreation
export const useIsWebSocketConnected = () => useWebSocketStore(state => state.isConnected);
export const useIsWebSocketConnecting = () => useWebSocketStore(state => state.isConnecting);
export const useWebSocketError = () => useWebSocketStore(state => state.error);

export const useIsProgressStreaming = () => useWebSocketStore(state => state.isProgressStreaming);
export const useProgressTokens = () => useWebSocketStore(state => state.progressTokens);
export const useProgressContent = () => useWebSocketStore(state => state.progressContent);
