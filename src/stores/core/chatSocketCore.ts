/**
 * Shared core for the chat socket stores.
 *
 * The authenticated and public chat surfaces speak the exact same DARE
 * socket protocol; they differ only in how they connect, which message
 * store they feed, and a couple of public-only progress behaviors. This
 * factory owns the protocol handling once — both stores compose it and
 * keep only their surface-specific actions.
 */
import { normalizeMessageId, parseChatEvent } from '@cmudco/chat-socket-contract';

import type { SocketService } from '@/services/socket.service';

import { scrollManager } from '@/utils/scrollManager';

import type { ContextTrace } from '@/types/contextTrace';
import type { ConversationHistoryMessage, SocketMessage } from '@/types/socket';
import { type ChatToolCall, mapToolEvent } from '@/types/toolCalls';

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

export interface ChatSocketState {
  isStopping: boolean;
  toolCallsByMessage: { [messageId: string]: ChatToolCall[] };
  contextTraceByMessage: { [messageId: string]: ContextTrace };
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  currentConversationId: string | null;

  // Progress streaming state (Socratic Books specific)
  isProgressStreaming: boolean;
  progressTokens: string[];
  progressContent: string;
}

export interface ChatSocketCoreActions {
  stopResponse: () => void;
  clearChatActivity: () => void;
  setError: (error: string | null) => void;
  handleSocketMessage: (data: SocketMessage) => void;

  setProgressStreaming: (streaming: boolean) => void;
  addProgressToken: (token: string) => void;
  clearProgressTokens: () => void;
  setProgressContent: (content: string) => void;
}

/** Where a message payload came from; lets mappers keep surface-specific defaults. */
export type MessageMapContext = 'history' | 'event' | 'stream';

export interface ChatMessageLike {
  id: string;
  message: string;
  senderType: 'USER' | 'ASSISTANT';
  streaming?: boolean;
}

/**
 * The slice of a message store the socket handler needs. Implemented by
 * conversationStore (authenticated) and publicBotStore (public).
 */
export interface ChatMessageTarget<TMessage extends ChatMessageLike> {
  setHistory: (messages: TMessage[]) => void;
  addMessage: (message: TMessage) => void;
  updateMessage: (messageId: string, updates: Partial<TMessage>) => void;
  getMessages: () => ReadonlyArray<TMessage>;
  setIsTyping: (isTyping: boolean) => void;
}

export interface ChatSocketCoreConfig<TMessage extends ChatMessageLike> {
  service: SocketService;
  /** Async so stores can lazy-import their message store (avoids circular imports). */
  resolveTarget: () => Promise<ChatMessageTarget<TMessage>>;
  mapMessage: (
    data: SocketMessage | ConversationHistoryMessage,
    senderType: 'USER' | 'ASSISTANT',
    context: MessageMapContext
  ) => TMessage;
  /** Public surface: clear stale progress when a new AI response starts streaming. */
  onStreamStart?: () => void;
}

// ════════════════════════════════════════════════════════════════════════════
// Initial State
// ════════════════════════════════════════════════════════════════════════════

export const chatSocketInitialState: ChatSocketState = {
  isStopping: false,
  toolCallsByMessage: {},
  contextTraceByMessage: {},
  isConnected: false,
  isConnecting: false,
  error: null,
  currentConversationId: null,
  isProgressStreaming: false,
  progressTokens: [],
  progressContent: '',
};

// ════════════════════════════════════════════════════════════════════════════
// Core Factory
// ════════════════════════════════════════════════════════════════════════════

type ChatSocketBase = ChatSocketState & ChatSocketCoreActions;
type CoreSet = (
  partial: Partial<ChatSocketBase> | ((state: ChatSocketBase) => Partial<ChatSocketBase>)
) => void;

export interface ChatSocketCore extends ChatSocketCoreActions {
  /** Register message/connection/error handlers on the service. Call before connecting. */
  wireService: () => void;
}

export function createChatSocketCore<TMessage extends ChatMessageLike>(
  set: CoreSet,
  get: () => ChatSocketBase,
  config: ChatSocketCoreConfig<TMessage>
): ChatSocketCore {
  const { service } = config;

  return {
    clearChatActivity: () => {
      set({ isStopping: false, error: null, toolCallsByMessage: {}, contextTraceByMessage: {} });
    },

    stopResponse: () => {
      const { currentConversationId, isStopping } = get();
      if (!currentConversationId || isStopping) return;
      set({ isStopping: true, error: null });
      service.stopGeneration(currentConversationId, error => {
        if (get().currentConversationId !== currentConversationId) return;
        set({ isStopping: false, ...(error ? { error } : {}) });
      });
    },

    wireService: () => {
      service.onMessage(data => {
        get().handleSocketMessage(data);
      });

      service.onConnectionChange(connected => {
        if (!connected) {
          const conversationId = get().currentConversationId;
          set({ isStopping: false, isProgressStreaming: false });
          config.resolveTarget().then(target => {
            if (get().currentConversationId !== conversationId) return;
            target
              .getMessages()
              .filter(message => message.streaming)
              .forEach(message =>
                target.updateMessage(message.id, { streaming: false } as Partial<TMessage>)
              );
            target.setIsTyping(false);
          });
        }
        set({
          isConnected: connected,
          isConnecting: false,
          error: connected ? null : get().error,
        });
      });

      service.onError(error => {
        set({
          error,
          isConnecting: false,
          isConnected: false,
        });
      });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    // ──────────────────────────────────────────────────────────────────────
    // Message Handling
    // ──────────────────────────────────────────────────────────────────────

    handleSocketMessage: (raw: SocketMessage) => {
      const parsed = parseChatEvent(raw);
      if (!parsed.success) {
        console.warn('[socket] Invalid chat event', parsed.issues);
        return;
      }
      const event = parsed.data as SocketMessage;
      const conversationId = get().currentConversationId;
      if (event.conversationId && event.conversationId !== conversationId) return;
      // Normalize wire IDs once: DARE emits numeric IDs while UI stores use strings.
      const data: SocketMessage & { id?: string; messageId?: string } = {
        ...event,
        id: event.id == null ? undefined : normalizeMessageId(event.id),
        messageId: event.messageId == null ? undefined : normalizeMessageId(event.messageId),
      };

      config
        .resolveTarget()
        .then(target => {
          if (get().currentConversationId !== conversationId) return;
          switch (data.type) {
            case 'conversation_history': {
              get().clearChatActivity();
              target.setIsTyping(Boolean(data.conversationHistory?.some(msg => msg.streaming)));
              if (data.conversationHistory) {
                target.setHistory(
                  data.conversationHistory.map(msg =>
                    config.mapMessage(msg, msg.senderType === 1 ? 'USER' : 'ASSISTANT', 'history')
                  )
                );
              }
              break;
            }

            case 'message': {
              const senderType = data.senderType === 1 ? 'USER' : 'ASSISTANT';

              if (data.regenerate) {
                if (data.streaming && data.id) {
                  set(state => ({
                    toolCallsByMessage: { ...state.toolCallsByMessage, [data.id!]: [] },
                    contextTraceByMessage: Object.fromEntries(
                      Object.entries(state.contextTraceByMessage).filter(([id]) => id !== data.id)
                    ),
                  }));
                }
                target.updateMessage(data.id!, {
                  ...config.mapMessage(data, senderType, 'event'),
                  streaming: Boolean(data.streaming),
                });
              } else {
                const message = config.mapMessage(data, senderType, 'event');
                const pendingMessage = target
                  .getMessages()
                  .find(
                    item =>
                      typeof item.id === 'string' &&
                      item.id.startsWith('pending-') &&
                      item.senderType === senderType &&
                      item.message === message.message
                  );
                if (pendingMessage) {
                  target.updateMessage(pendingMessage.id, message);
                } else {
                  target.addMessage(message);
                }
              }

              if (senderType === 'ASSISTANT') {
                target.setIsTyping(Boolean(data.streaming));
                if (!data.streaming) set({ isStopping: false });
              }
              break;
            }

            case 'ai_stream': {
              const senderType = data.senderType === 1 ? 'USER' : 'ASSISTANT';

              if (data.regenerate) {
                target.updateMessage(data.id!, {
                  ...config.mapMessage(data, senderType, 'stream'),
                  streaming: data.streaming,
                });
              } else {
                const existingMessage = target.getMessages().find(m => m.id === data.id);
                if (existingMessage) {
                  target.updateMessage(data.id!, {
                    message: data.message || '',
                    streaming: data.streaming,
                  } as Partial<TMessage>);
                } else {
                  config.onStreamStart?.();
                  target.addMessage(config.mapMessage(data, senderType, 'stream'));
                }
              }

              // Keep the latest streamed content visible
              if (data.streaming && data.senderType !== 1) {
                scrollManager.triggerScroll();
              }

              if (senderType === 'ASSISTANT') {
                target.setIsTyping(Boolean(data.streaming));
                if (!data.streaming) set({ isStopping: false });
              }
              break;
            }

            case 'stream_chunk': {
              const currentMessage = target.getMessages().find(m => m.id === data.messageId);
              if (currentMessage) {
                target.updateMessage(data.messageId!, {
                  message: (currentMessage.message || '') + (data.chunk || ''),
                  streaming: true,
                } as Partial<TMessage>);
              }
              break;
            }

            case 'error': {
              set({
                isStopping: false,
                error: data.errorMessage || data.message || 'An unexpected chat error occurred.',
                isProgressStreaming: false,
              });
              target
                .getMessages()
                .filter(msg => msg.streaming)
                .forEach(msg =>
                  target.updateMessage(msg.id, { streaming: false } as Partial<TMessage>)
                );
              target.setIsTyping(false);
              break;
            }

            case 'stream_end': {
              set({ isStopping: false });
              target.updateMessage(data.messageId!, { streaming: false } as Partial<TMessage>);
              target.setIsTyping(false);
              break;
            }

            // ────────────────────────────────────────────────────────────────
            // Tool-Loop Events (unified vocabulary shared with DARE chat)
            // ────────────────────────────────────────────────────────────────

            case 'tool_call_pending':
            case 'tool_call_args_progress':
            case 'tool_call_executing':
            case 'tool_call_result':
            case 'tool_rounds_capped':
            case 'context_trace': {
              if (!data.messageId) break;
              const messageId = data.messageId;
              if (data.type === 'context_trace') {
                if (data.trace)
                  set(state => ({
                    contextTraceByMessage: {
                      ...state.contextTraceByMessage,
                      [messageId]: data.trace as ContextTrace,
                    },
                  }));
              } else {
                const partial = mapToolEvent(data);
                if (partial?.toolCallId)
                  set(state => {
                    const calls = state.toolCallsByMessage[messageId] || [];
                    const exists = calls.some(call => call.toolCallId === partial.toolCallId);
                    const defined = Object.fromEntries(
                      Object.entries(partial).filter(([, value]) => value !== undefined)
                    );
                    const next = exists
                      ? calls.map(call =>
                          call.toolCallId === partial.toolCallId ? { ...call, ...defined } : call
                        )
                      : [...calls, { toolName: '', status: 'pending', ...defined } as ChatToolCall];
                    return {
                      toolCallsByMessage: { ...state.toolCallsByMessage, [messageId]: next },
                    };
                  });
              }
              break;
            }

            // ────────────────────────────────────────────────────────────────
            // Learning Progress Events (Socratic Books Specific)
            // ────────────────────────────────────────────────────────────────

            case 'progress_start': {
              get().clearProgressTokens();
              set({ isProgressStreaming: true });
              break;
            }

            case 'progress_token': {
              // Clear previous progress tokens when a new stream starts
              if (get().progressTokens.length > 0 && !get().isProgressStreaming) {
                get().clearProgressTokens();
              }
              if (data.token) {
                get().addProgressToken(data.token);
              }
              break;
            }

            case 'progress_stream': {
              // Clear previous progress tokens when a new stream starts
              if (get().progressTokens.length > 0 && !get().isProgressStreaming) {
                get().clearProgressTokens();
              }
              set({ isProgressStreaming: true });
              if (data.chunk) {
                get().addProgressToken(data.chunk);
              }
              break;
            }

            case 'progress_complete':
            case 'progress_error':
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
        set({ progressContent: get().progressTokens.join('') });
      }
    },

    addProgressToken: (token: string) => {
      set(state => ({ progressTokens: [...state.progressTokens, token] }));
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
  };
}
