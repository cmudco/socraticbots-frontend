import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { scrollManager } from '@/utils/scrollManager';

// WebSocket message types
interface BaseWebSocketMessage {
  type: string;
  id?: string;
  message?: string;
  senderType?: number;
  senderName?: string;
  isSender?: boolean;
  date?: string;
  streaming?: boolean;
  llmId?: number;
  cost?: number;
  inputTokens?: number;
  outputTokens?: number;
  feedbackType?: number | null;
  feedbackText?: string | null;
  isEdited?: boolean;
  isRegenerated?: boolean;
  originalMessage?: string | null;
  regenerate?: boolean;
  messageId?: string;
  chunk?: string;
  conversationHistory?: Array<{
    id: string;
    message: string;
    senderType: number;
    senderName?: string;
    isSender?: boolean;
    date?: string;
    streaming?: boolean;
    llmId?: number;
    cost?: number;
    inputTokens?: number;
    outputTokens?: number;
    feedbackType?: number | null;
    feedbackText?: string | null;
    isEdited?: boolean;
    isRegenerated?: boolean;
    originalMessage?: string | null;
  }>;
}

export interface PublicWebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  socket: WebSocket | null;
}

export interface PublicWebSocketActions {
  // Connection management
  connect: (conversationId: string, sessionId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  setError: (error: string | null) => void;

  // Message handling
  handleWebSocketMessage: (data: BaseWebSocketMessage) => void;

  // Message sending
  sendMessage: (payload: Record<string, unknown>) => void;
}

type PublicWebSocketStore = PublicWebSocketState & PublicWebSocketActions;

const initialState: PublicWebSocketState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  socket: null,
};

export const usePublicWebSocketStore = create<PublicWebSocketStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    connect: async (conversationId: string, sessionId: string) => {
      const { isConnecting, isConnected } = get();

      if (isConnecting) {
        return;
      }

      if (isConnected) {
        await get().disconnect();
      }

      return new Promise<void>((resolve, reject) => {
        try {
          set({ isConnecting: true, error: null });

          // Build WebSocket URL for anonymous connection to DARE backend
          // Use the public bot WebSocket endpoint
          const DARE_WEBSOCKET_URL = import.meta.env.VITE_DARE_WEBSOCKET_URL;
          const socketUrl = `${DARE_WEBSOCKET_URL}/public/conversations/${conversationId}/?session_id=${encodeURIComponent(sessionId)}`;

          console.log('Connecting to public WebSocket:', socketUrl);

          const socket = new WebSocket(socketUrl);

          socket.onopen = () => {
            console.log('Public WebSocket connected');
            set({
              isConnected: true,
              isConnecting: false,
              socket,
              error: null,
            });
            resolve();
          };

          socket.onmessage = event => {
            try {
              const data = JSON.parse(event.data);
              get().handleWebSocketMessage(data);
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };

          socket.onerror = error => {
            console.error('Public WebSocket error:', error);
            set({
              error: 'WebSocket connection error',
              isConnecting: false,
              isConnected: false,
            });
            reject(new Error('WebSocket connection error'));
          };

          socket.onclose = () => {
            console.log('Public WebSocket disconnected');
            set({
              isConnected: false,
              isConnecting: false,
              socket: null,
            });
          };
        } catch (error) {
          console.error('Error connecting WebSocket:', error);
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isConnecting: false,
          });
          reject(error);
        }
      });
    },

    disconnect: () => {
      return new Promise<void>(resolve => {
        const { socket } = get();
        if (socket) {
          try {
            if (
              socket.readyState === WebSocket.OPEN ||
              socket.readyState === WebSocket.CONNECTING
            ) {
              socket.close(1000, 'User disconnected');
            }
          } catch (error) {
            console.warn('Error closing WebSocket:', error);
          }

          set(initialState);

          setTimeout(resolve, 50);
        } else {
          set(initialState);
          resolve();
        }
      });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    handleWebSocketMessage: (data: BaseWebSocketMessage) => {
      // Import the public bot store dynamically to avoid circular imports
      import('./publicBotStore')
        .then(({ usePublicBotStore }) => {
          const publicBotStore = usePublicBotStore.getState();

          switch (data.type) {
            case 'conversation_history': {
              if (data.conversationHistory) {
                const mappedMessages = data.conversationHistory.map(msg => ({
                  id: msg.id,
                  message: msg.message,
                  senderType: (msg.senderType === 1 ? 'USER' : 'ASSISTANT') as 'USER' | 'ASSISTANT',
                  senderName: msg.senderName || '',
                  isSender: msg.isSender || false,
                  date: msg.date || new Date().toISOString(),
                  streaming: msg.streaming,
                  llmId: msg.llmId,
                  cost: msg.cost,
                  inputTokens: msg.inputTokens,
                  outputTokens: msg.outputTokens,
                  feedbackType: msg.feedbackType,
                  feedbackText: msg.feedbackText,
                  isEdited: msg.isEdited,
                  isRegenerated: msg.isRegenerated,
                  originalMessage: msg.originalMessage,
                }));
                publicBotStore.setMessages(mappedMessages);
              }
              break;
            }

            case 'message': {
              const senderType = data.senderType === 1 ? 'USER' : 'ASSISTANT';

              if (data.regenerate) {
                publicBotStore.updateMessage(data.id!, {
                  message: data.message || '',
                  senderType,
                  streaming: false,
                  llmId: data.llmId,
                  cost: data.cost,
                  inputTokens: data.inputTokens,
                  outputTokens: data.outputTokens,
                  feedbackType: data.feedbackType,
                  feedbackText: data.feedbackText,
                  isEdited: data.isEdited,
                  isRegenerated: data.isRegenerated,
                  originalMessage: data.originalMessage,
                });
              } else {
                publicBotStore.addMessage({
                  id: data.id!,
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
                  originalMessage: data.originalMessage,
                });
              }

              // Clear typing state when message is not streaming
              if (!data.streaming) {
                publicBotStore.setIsTyping(false);
              }
              break;
            }

            case 'ai_stream': {
              const assistantSenderType = data.senderType === 1 ? 'USER' : 'ASSISTANT';

              if (data.regenerate) {
                publicBotStore.updateMessage(data.id!, {
                  ...data,
                  senderType: assistantSenderType,
                  streaming: data.streaming,
                });
              } else {
                // Check if message already exists, if not create it
                const existingMessage = publicBotStore.messages.find(m => m.id === data.id);
                if (existingMessage) {
                  // Update existing message with streaming content
                  publicBotStore.updateMessage(data.id!, {
                    message: data.message || '',
                    streaming: data.streaming,
                  });
                } else {
                  // Create new message
                  publicBotStore.addMessage({
                    id: data.id!,
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
                    originalMessage: data.originalMessage,
                  });
                }
              }

              // Trigger scroll for streaming messages to keep latest content visible
              if (data.streaming && data.senderType !== 1) {
                scrollManager.triggerScroll();
              }

              // Clear typing state when streaming ends
              if (!data.streaming) {
                publicBotStore.setIsTyping(false);
              }
              break;
            }

            case 'stream_chunk': {
              const currentMessage = publicBotStore.messages.find(m => m.id === data.messageId);
              if (currentMessage) {
                publicBotStore.updateMessage(data.messageId!, {
                  message: (currentMessage.message || '') + (data.chunk || ''),
                  streaming: true,
                });
              }
              break;
            }

            case 'stream_end': {
              publicBotStore.updateMessage(data.messageId!, {
                streaming: false,
              });
              // Clear typing state when streaming ends
              publicBotStore.setIsTyping(false);
              break;
            }
          }
        })
        .catch(error => {
          console.error('Error handling WebSocket message:', error);
        });
    },

    sendMessage: (payload: Record<string, unknown>) => {
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

// Selector hooks for better performance
export const useIsPublicWebSocketConnected = () =>
  usePublicWebSocketStore(state => state.isConnected);
export const useIsPublicWebSocketConnecting = () =>
  usePublicWebSocketStore(state => state.isConnecting);
export const usePublicWebSocketError = () => usePublicWebSocketStore(state => state.error);
