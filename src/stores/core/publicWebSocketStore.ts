/**
 * WebSocket Store for Public/Anonymous Users
 *
 * Manages Socket.IO connection to DARE backend for public bot conversations.
 * Uses the publicSocketService singleton for connection management.
 *
 * Key Features:
 * - Session-based authentication (sessionId + conversationId)
 * - One connection per conversation (connects when conversation is available)
 * - Learning progress tracking (Socratic Books specific)
 * - Automatic reconnection via Socket.IO
 *
 * Note: Public bots are auto-subscribed on connect by the backend,
 * so no separate subscription call is needed.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { publicSocketService } from '@/services/socket.service';

import { scrollManager } from '@/utils/scrollManager';

import type { SocketMessage } from '@/types/socket';

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

export interface PublicWebSocketState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Session tracking
  sessionId: string | null;
  currentConversationId: string | null;

  // Progress streaming state (Socratic Books specific)
  isProgressStreaming: boolean;
  progressTokens: string[];
  progressContent: string;
}

export interface PublicWebSocketActions {
  // Connection management (connects to specific conversation)
  connect: (conversationId: string, sessionId: string) => void;
  disconnect: () => void;
  setError: (error: string | null) => void;

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

type PublicWebSocketStore = PublicWebSocketState & PublicWebSocketActions;

// ════════════════════════════════════════════════════════════════════════════
// Initial State
// ════════════════════════════════════════════════════════════════════════════

const initialState: PublicWebSocketState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  sessionId: null,
  currentConversationId: null,
  isProgressStreaming: false,
  progressTokens: [],
  progressContent: '',
};

// ════════════════════════════════════════════════════════════════════════════
// Store
// ════════════════════════════════════════════════════════════════════════════

export const usePublicWebSocketStore = create<PublicWebSocketStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ──────────────────────────────────────────────────────────────────────
    // Connection Management
    // ──────────────────────────────────────────────────────────────────────

    connect: (conversationId: string, sessionId: string) => {
      const { isConnecting, isConnected, currentConversationId } = get();

      // Already connected to this conversation
      if (isConnected && currentConversationId === conversationId) {
        return;
      }

      if (isConnecting) {
        return;
      }

      set({ isConnecting: true, error: null, sessionId, currentConversationId: conversationId });

      // Set up event handlers
      publicSocketService.onMessage(data => {
        get().handleSocketMessage(data);
      });

      publicSocketService.onConnectionChange(connected => {
        set({
          isConnected: connected,
          isConnecting: false,
          error: connected ? null : get().error,
        });
      });

      publicSocketService.onError(error => {
        set({
          error,
          isConnecting: false,
          isConnected: false,
        });
      });

      // Connect to conversation with session ID (auto-subscribes on backend)
      publicSocketService.connectWithSession(sessionId, conversationId);
    },

    disconnect: () => {
      publicSocketService.disconnect();
      publicSocketService.clearHandlers();
      set(initialState);
    },

    setError: (error: string | null) => {
      set({ error });
    },

    // ──────────────────────────────────────────────────────────────────────
    // Message Handling
    // ──────────────────────────────────────────────────────────────────────

    handleSocketMessage: (data: SocketMessage) => {
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
              const senderType: 'USER' | 'ASSISTANT' = data.senderType === 1 ? 'USER' : 'ASSISTANT';

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
                // New message being added
                // If this is a new ASSISTANT message that is NOT streaming (completed), clear old progress and show loading
                if (senderType === 'ASSISTANT' && !data.streaming) {
                  set({
                    progressTokens: [],
                    progressContent: '',
                    isProgressStreaming: true,
                  });
                }

                const message = {
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
                };
                const pendingMessage = publicBotStore.messages.find(
                  item =>
                    typeof item.id === 'string' &&
                    item.id.startsWith('pending-') &&
                    item.senderType === senderType &&
                    item.message === message.message
                );

                if (pendingMessage) {
                  publicBotStore.updateMessage(pendingMessage.id, message);
                } else {
                  publicBotStore.addMessage(message);
                }
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
                  // Create new message - this is a NEW AI response starting
                  // Clear old progress to prepare for new assessment
                  get().clearProgressTokens();

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

            case 'error': {
              set({
                error: data.errorMessage || data.message || 'An unexpected chat error occurred.',
                isProgressStreaming: false,
              });
              publicBotStore.setIsTyping(false);
              break;
            }

            // ────────────────────────────────────────────────────────────────
            // Learning Progress Events (Socratic Books Specific)
            // ────────────────────────────────────────────────────────────────

            case 'progress_start': {
              set({ isProgressStreaming: true });
              get().clearProgressTokens();
              break;
            }

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

            case 'progress_complete': {
              set({ isProgressStreaming: false });
              break;
            }

            case 'progress_error': {
              set({ isProgressStreaming: false });
              break;
            }

            case 'progress_end': {
              set({ isProgressStreaming: false });
              break;
            }

            case 'latest_progress': {
              if (data.assessment && data.assessment.content) {
                set({
                  progressContent: data.assessment.content,
                  isProgressStreaming: false,
                  progressTokens: [data.assessment.content],
                });
              }
              break;
            }
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
      const { isConnected } = get();

      if (!isConnected) {
        console.error('Cannot send message: WebSocket not connected');
        return;
      }

      // Send message (fire-and-forget with error callback)
      publicSocketService.sendMessage(payload, error => {
        set({ error });
        import('./publicBotStore').then(({ usePublicBotStore }) => {
          usePublicBotStore.getState().setIsTyping(false);
        });
      });
    },
  }))
);

// ════════════════════════════════════════════════════════════════════════════
// Selector Hooks
// ════════════════════════════════════════════════════════════════════════════

// Connection state selectors
export const useIsPublicWebSocketConnected = () =>
  usePublicWebSocketStore(state => state.isConnected);
export const useIsPublicWebSocketConnecting = () =>
  usePublicWebSocketStore(state => state.isConnecting);
export const usePublicWebSocketError = () => usePublicWebSocketStore(state => state.error);

// Progress state selectors
export const useIsPublicProgressStreaming = () =>
  usePublicWebSocketStore(state => state.isProgressStreaming);
export const usePublicProgressTokens = () => usePublicWebSocketStore(state => state.progressTokens);
export const usePublicProgressContent = () =>
  usePublicWebSocketStore(state => state.progressContent);

// Subscription state selectors
export const usePublicCurrentConversationId = () =>
  usePublicWebSocketStore(state => state.currentConversationId);
