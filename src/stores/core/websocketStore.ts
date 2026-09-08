/**
 * WebSocket Store for Authenticated Users
 *
 * Manages Socket.IO connection to DARE backend for authenticated bot conversations.
 * Uses the authenticatedSocketService singleton for connection management.
 *
 * Key Features:
 * - Single persistent connection per user session
 * - Room-based conversation subscriptions
 * - Learning progress tracking (Socratic Books specific)
 * - Automatic reconnection with re-subscription
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { authenticatedSocketService } from '@/services/socket.service';

import { scrollManager } from '@/utils/scrollManager';

import type { SocketMessage } from '@/types/socket';

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

export interface WebSocketState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Current subscription
  currentConversationId: string | null;

  // Progress streaming state (Socratic Books specific)
  isProgressStreaming: boolean;
  progressTokens: string[];
  progressContent: string;
}

export interface WebSocketActions {
  // Connection management
  connect: (token: string) => void;
  disconnect: () => void;
  setError: (error: string | null) => void;

  // Subscription management
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;

  // Message handling
  handleSocketMessage: (data: SocketMessage) => void;

  // Progress streaming actions
  setProgressStreaming: (streaming: boolean) => void;
  addProgressToken: (token: string) => void;
  clearProgressTokens: () => void;
  setProgressContent: (content: string) => void;

  // Message sending
  sendMessage: (payload: Record<string, unknown>) => void;
}

type WebSocketStore = WebSocketState & WebSocketActions;

// ════════════════════════════════════════════════════════════════════════════
// Initial State
// ════════════════════════════════════════════════════════════════════════════

const initialState: WebSocketState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  currentConversationId: null,
  isProgressStreaming: false,
  progressTokens: [],
  progressContent: '',
};

// ════════════════════════════════════════════════════════════════════════════
// Store
// ════════════════════════════════════════════════════════════════════════════

export const useWebSocketStore = create<WebSocketStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ──────────────────────────────────────────────────────────────────────
    // Connection Management
    // ──────────────────────────────────────────────────────────────────────

    connect: (token: string) => {
      const { isConnecting, isConnected } = get();

      if (isConnecting || isConnected) {
        return;
      }

      set({ isConnecting: true, error: null });

      // Set up event handlers
      authenticatedSocketService.onMessage(data => {
        get().handleSocketMessage(data);
      });

      authenticatedSocketService.onConnectionChange(connected => {
        set({
          isConnected: connected,
          isConnecting: false,
          error: connected ? null : get().error,
        });
      });

      authenticatedSocketService.onError(error => {
        set({
          error,
          isConnecting: false,
          isConnected: false,
        });
      });

      // Connect with JWT token
      authenticatedSocketService.connectWithToken(token);
    },

    disconnect: () => {
      authenticatedSocketService.disconnect();
      authenticatedSocketService.clearHandlers();
      set(initialState);
    },

    setError: (error: string | null) => {
      set({ error });
    },

    // ──────────────────────────────────────────────────────────────────────
    // Subscription Management
    // ──────────────────────────────────────────────────────────────────────

    subscribeToConversation: (conversationId: string) => {
      const { currentConversationId } = get();

      // Unsubscribe from previous conversation if different
      if (currentConversationId && currentConversationId !== conversationId) {
        get().unsubscribeFromConversation(currentConversationId);
      }

      // Clear previous state for new conversation
      get().clearProgressTokens();
      set({ currentConversationId: conversationId });

      // Subscribe to new conversation (fire-and-forget with error callback)
      authenticatedSocketService.subscribe(
        conversationId,
        undefined, // onSuccess - not needed, state already set optimistically
        error => set({ error })
      );
    },

    unsubscribeFromConversation: (conversationId: string) => {
      authenticatedSocketService.unsubscribe(conversationId);

      const { currentConversationId } = get();
      if (currentConversationId === conversationId) {
        set({ currentConversationId: null });
      }
    },

    // ──────────────────────────────────────────────────────────────────────
    // Message Handling
    // ──────────────────────────────────────────────────────────────────────

    handleSocketMessage: (data: SocketMessage) => {
      // Import the conversation store dynamically to avoid circular imports
      import('./conversationStore')
        .then(({ useConversationStore }) => {
          const conversationStore = useConversationStore.getState();

          // Helper to map socket message data to DareMessage format
          const mapToDareMessage = (msg: SocketMessage, senderType: 'USER' | 'ASSISTANT') => ({
            id: msg.id!,
            message: msg.message || '',
            senderType,
            senderName: msg.senderName || '',
            isSender: msg.isSender || false,
            date: msg.date || new Date().toISOString(),
            streaming: msg.streaming || false,
            llmId: msg.llmId,
            cost: msg.cost != null ? String(msg.cost) : undefined,
            inputTokens: msg.inputTokens ?? undefined,
            outputTokens: msg.outputTokens ?? undefined,
            feedbackType: msg.feedbackType != null ? String(msg.feedbackType) : undefined,
            feedbackText: msg.feedbackText ?? undefined,
            isEdited: msg.isEdited,
            isRegenerated: msg.isRegenerated,
            originalMessage: msg.originalMessage ?? undefined,
          });

          switch (data.type) {
            case 'conversation_history':
              if (data.conversationHistory) {
                const mappedMessages = data.conversationHistory.map(msg => ({
                  id: msg.id,
                  message: msg.message,
                  senderType: (msg.senderType === 1 ? 'USER' : 'ASSISTANT') as 'USER' | 'ASSISTANT',
                  senderName: msg.senderName || '',
                  isSender: msg.isSender || false,
                  date: msg.date || new Date().toISOString(),
                  streaming: msg.streaming || false,
                  llmId: msg.llmId,
                  cost: msg.cost != null ? String(msg.cost) : undefined,
                  inputTokens: msg.inputTokens ?? undefined,
                  outputTokens: msg.outputTokens ?? undefined,
                  feedbackType: msg.feedbackType != null ? String(msg.feedbackType) : undefined,
                  feedbackText: msg.feedbackText ?? undefined,
                  isEdited: msg.isEdited,
                  isRegenerated: msg.isRegenerated,
                  originalMessage: msg.originalMessage ?? undefined,
                }));
                conversationStore.setConversationHistory(mappedMessages);
              }
              break;

            case 'message': {
              const senderType = data.senderType === 1 ? 'USER' : 'ASSISTANT';
              const message = mapToDareMessage(data, senderType);

              if (data.regenerate) {
                conversationStore.updateMessage(data.id!, {
                  message: data.message || '',
                  senderType,
                  streaming: false,
                });
              } else {
                const pendingMessage = conversationStore.messages.find(
                  item =>
                    typeof item.id === 'string' &&
                    item.id.startsWith('pending-') &&
                    item.senderType === senderType &&
                    item.message === message.message
                );

                if (pendingMessage) {
                  conversationStore.updateMessage(pendingMessage.id, message);
                } else {
                  conversationStore.addMessage(message);
                }
              }

              // Clear typing state when message is not streaming
              if (!data.streaming) {
                conversationStore.setIsTyping(false);
              }
              break;
            }

            case 'ai_stream': {
              const assistantSenderType: 'USER' | 'ASSISTANT' =
                data.senderType === 1 ? 'USER' : 'ASSISTANT';

              if (data.regenerate) {
                conversationStore.updateMessage(data.id!, {
                  message: data.message || '',
                  senderType: assistantSenderType,
                  streaming: data.streaming,
                });
              } else {
                // Check if message already exists, if not create it
                const existingMessage = conversationStore.messages.find(m => m.id === data.id);
                if (existingMessage) {
                  // Update existing message with streaming content
                  conversationStore.updateMessage(data.id!, {
                    message: data.message || '',
                    streaming: data.streaming,
                  });
                } else {
                  // Create new message
                  conversationStore.addMessage(mapToDareMessage(data, assistantSenderType));
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
            }

            case 'stream_chunk': {
              const currentMessage = conversationStore.messages.find(m => m.id === data.messageId);
              if (currentMessage) {
                conversationStore.updateMessage(data.messageId!, {
                  message: (currentMessage.message || '') + (data.chunk || ''),
                  streaming: true,
                });
              }
              break;
            }

            case 'stream_end':
              conversationStore.updateMessage(data.messageId!, {
                streaming: false,
              });
              // Clear typing state when streaming ends
              conversationStore.setIsTyping(false);
              break;

            case 'error':
              set({
                error: data.errorMessage || data.message || 'An unexpected chat error occurred.',
                isProgressStreaming: false,
              });
              conversationStore.setIsTyping(false);
              break;

            // ────────────────────────────────────────────────────────────────
            // Learning Progress Events (Socratic Books Specific)
            // ────────────────────────────────────────────────────────────────

            case 'progress_start':
              set({ isProgressStreaming: true });
              get().clearProgressTokens();
              break;

            case 'progress_token': {
              // Clear previous progress tokens when a new stream starts
              const tokensLength = get().progressTokens.length;
              if (tokensLength > 0 && !get().isProgressStreaming) {
                get().clearProgressTokens();
              }
              if (data.token) {
                get().addProgressToken(data.token);
              }
              break;
            }

            case 'progress_stream': {
              // Clear previous progress tokens when a new stream starts
              const currentTokens = get().progressTokens;
              if (currentTokens.length > 0 && !get().isProgressStreaming) {
                get().clearProgressTokens();
              }
              set({ isProgressStreaming: true });
              if (data.chunk) {
                get().addProgressToken(data.chunk);
              }
              break;
            }

            case 'progress_complete':
              set({ isProgressStreaming: false });
              break;

            case 'progress_error':
              set({ isProgressStreaming: false });
              break;

            case 'progress_end':
              set({ isProgressStreaming: false });
              break;

            case 'latest_progress':
              if (data.assessment && data.assessment.content) {
                set({
                  progressContent: data.assessment.content,
                  isProgressStreaming: false,
                  progressTokens: [data.assessment.content],
                });
              }
              break;
          }
        })
        .catch(error => {
          console.error('Error handling Socket message:', error);
        });
    },

    // ──────────────────────────────────────────────────────────────────────
    // Progress Streaming Actions
    // ──────────────────────────────────────────────────────────────────────

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
        progressTokens: [...state.progressTokens, token],
      }));
    },

    clearProgressTokens: () => {
      set({
        progressTokens: [],
        progressContent: '',
        isProgressStreaming: false,
      });
    },

    setProgressContent: (content: string) => {
      set({ progressContent: content });
    },

    // ──────────────────────────────────────────────────────────────────────
    // Message Sending
    // ──────────────────────────────────────────────────────────────────────

    sendMessage: (payload: Record<string, unknown>) => {
      const { isConnected, currentConversationId } = get();

      if (!isConnected) {
        console.error('Cannot send message: Socket not connected');
        return;
      }

      if (!currentConversationId) {
        console.error('Cannot send message: No active conversation');
        return;
      }

      // Add conversation ID to payload and send (fire-and-forget with error callback)
      authenticatedSocketService.sendMessage(
        { ...payload, conversationId: currentConversationId },
        error => {
          set({ error });
          import('./conversationStore').then(({ useConversationStore }) => {
            useConversationStore.getState().setIsTyping(false);
          });
        }
      );
    },
  }))
);

// ════════════════════════════════════════════════════════════════════════════
// Selector Hooks
// ════════════════════════════════════════════════════════════════════════════

// Connection state selectors
export const useIsWebSocketConnected = () => useWebSocketStore(state => state.isConnected);
export const useIsWebSocketConnecting = () => useWebSocketStore(state => state.isConnecting);
export const useWebSocketError = () => useWebSocketStore(state => state.error);

// Progress state selectors
export const useIsProgressStreaming = () => useWebSocketStore(state => state.isProgressStreaming);
export const useProgressTokens = () => useWebSocketStore(state => state.progressTokens);
export const useProgressContent = () => useWebSocketStore(state => state.progressContent);

// Subscription state selectors
export const useCurrentConversationId = () =>
  useWebSocketStore(state => state.currentConversationId);
