/**
 * WebSocket Store for Authenticated Users
 *
 * Manages Socket.IO connection to DARE backend for authenticated bot
 * conversations via the authenticatedSocketService singleton. Protocol
 * handling lives in chatSocketCore; this store owns the authenticated
 * connection lifecycle (JWT connect, room subscriptions).
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { DareMessage } from '@/services/conversation.service';
import { authenticatedSocketService } from '@/services/socket.service';

import type { ConversationHistoryMessage, SocketMessage } from '@/types/socket';
import { type ChatToolCall, toolCallFromHistory } from '@/types/toolCalls';

import {
  type ChatSocketCoreActions,
  type ChatSocketState,
  chatSocketInitialState,
  createChatSocketCore,
} from './chatSocketCore';

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

export type WebSocketState = ChatSocketState;

export interface WebSocketActions extends ChatSocketCoreActions {
  connect: (token: string) => void;
  disconnect: () => void;

  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;

  sendMessage: (payload: Record<string, unknown>) => void;
}

type WebSocketStore = WebSocketState & WebSocketActions;

// ════════════════════════════════════════════════════════════════════════════
// Message Mapping
// ════════════════════════════════════════════════════════════════════════════

const mapToDareMessage = (
  msg: SocketMessage | ConversationHistoryMessage,
  senderType: 'USER' | 'ASSISTANT'
): DareMessage => ({
  id: msg.id as string,
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
  toolCalls: Array.isArray(msg.toolCalls) ? msg.toolCalls.map(toolCallFromHistory) : undefined,
});

/** Map a tool-loop socket event to a partial ChatToolCall for upserting. */
const mapToolEvent = (data: SocketMessage): Partial<ChatToolCall> | null => {
  const base = {
    toolCallId: data.toolCallId as string,
    toolName: data.toolName as string | undefined,
    serverSlug: data.serverSlug as string | undefined,
    origin: data.origin as string | undefined,
    round: data.round as number | undefined,
  };
  switch (data.type) {
    case 'tool_call_pending':
      return { ...base, status: 'pending' };
    case 'tool_call_args_progress':
      return { toolCallId: base.toolCallId, argsChars: data.argsChars as number };
    case 'tool_call_executing':
      return {
        ...base,
        status: 'executing',
        arguments: data.arguments as Record<string, unknown> | undefined,
      };
    case 'tool_call_result':
      return {
        ...base,
        status: data.status === 'failed' ? 'failed' : 'completed',
        error: (data.error as string | null | undefined) ?? undefined,
        result:
          (data.dareResult as Record<string, unknown>) ??
          (data.providerResult as Record<string, unknown>) ??
          (data.mcpResult as Record<string, unknown>) ??
          null,
      };
    default:
      return null;
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Store
// ════════════════════════════════════════════════════════════════════════════

export const useWebSocketStore = create<WebSocketStore>()(
  subscribeWithSelector((set, get) => {
    const core = createChatSocketCore<DareMessage>(set, get, {
      service: authenticatedSocketService,
      // Lazy import to avoid a circular dependency with conversationStore
      resolveTarget: async () => {
        const { useConversationStore } = await import('./conversationStore');
        const conversationStore = useConversationStore.getState();
        return {
          setHistory: conversationStore.setConversationHistory,
          addMessage: conversationStore.addMessage,
          updateMessage: conversationStore.updateMessage,
          getMessages: () => useConversationStore.getState().messages,
          setIsTyping: conversationStore.setIsTyping,
        };
      },
      mapMessage: mapToDareMessage,
      onToolEvent: data => {
        if (data.messageId == null || !data.toolCallId) return;
        const partial = mapToolEvent(data);
        if (!partial) return;
        import('./conversationStore').then(({ useConversationStore }) => {
          useConversationStore.getState().upsertToolCall(String(data.messageId), partial);
        });
      },
    });

    return {
      ...chatSocketInitialState,
      ...core,

      // ──────────────────────────────────────────────────────────────────────
      // Connection Management
      // ──────────────────────────────────────────────────────────────────────

      connect: (token: string) => {
        const { isConnecting, isConnected } = get();

        if (isConnecting || isConnected) {
          return;
        }

        set({ isConnecting: true, error: null });

        core.wireService();
        authenticatedSocketService.connectWithToken(token);
      },

      disconnect: () => {
        authenticatedSocketService.disconnect();
        authenticatedSocketService.clearHandlers();
        set(chatSocketInitialState);
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
          error => core.handleSocketMessage({ type: 'error', errorMessage: error })
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
          error => core.handleSocketMessage({ type: 'error', errorMessage: error })
        );
      },
    };
  })
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
