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

import type { ContextTrace } from '@/types/contextTrace';
import type { ConversationHistoryMessage, SocketMessage } from '@/types/socket';
import { toolCallFromHistory } from '@/types/toolCalls';

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
  id: String(msg.id),
  snippets: msg.snippets,
  retrievalTrace: msg.retrievalTrace,
  webSearchSources: msg.webSearchSources,
  llm: msg.llm,
  litellmModelName: msg.litellmModelName,
  message: msg.message || '',
  senderType,
  senderName: msg.senderName || '',
  isSender: msg.isSender || false,
  date: msg.date || msg.createdAt || new Date().toISOString(),
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
  contextTrace: (msg.contextTrace as unknown as ContextTrace | null | undefined) ?? undefined,
});

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
        get().clearChatActivity();
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
