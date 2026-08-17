/**
 * WebSocket Store for Public/Anonymous Users
 *
 * Manages Socket.IO connection to DARE backend for public bot conversations
 * via the publicSocketService singleton. Protocol handling lives in
 * chatSocketCore; this store owns the session-based connection lifecycle.
 *
 * Note: Public bots are auto-subscribed on connect by the backend,
 * so no separate subscription call is needed.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { publicSocketService } from '@/services/socket.service';

import type { PublicBotMessage } from '@/types/publicBot';
import type { ConversationHistoryMessage, SocketMessage } from '@/types/socket';

import {
  type ChatSocketCoreActions,
  type ChatSocketState,
  type MessageMapContext,
  chatSocketInitialState,
  createChatSocketCore,
} from './chatSocketCore';

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

export interface PublicWebSocketState extends ChatSocketState {
  sessionId: string | null;
}

export interface PublicWebSocketActions extends ChatSocketCoreActions {
  // Connection management (connects to specific conversation)
  connect: (conversationId: string, sessionId: string) => void;
  disconnect: () => void;

  sendMessage: (payload: Record<string, unknown>) => void;
}

type PublicWebSocketStore = PublicWebSocketState & PublicWebSocketActions;

// ════════════════════════════════════════════════════════════════════════════
// Initial State
// ════════════════════════════════════════════════════════════════════════════

const initialState: PublicWebSocketState = {
  ...chatSocketInitialState,
  sessionId: null,
};

// ════════════════════════════════════════════════════════════════════════════
// Message Mapping
// ════════════════════════════════════════════════════════════════════════════

const mapToPublicBotMessage = (
  msg: SocketMessage | ConversationHistoryMessage,
  senderType: 'USER' | 'ASSISTANT',
  context: MessageMapContext
): PublicBotMessage => ({
  id: msg.id as string,
  message: msg.message || '',
  senderType,
  // Streamed AI responses historically defaulted the name to 'AI Assistant'
  senderName: msg.senderName || (context === 'stream' ? 'AI Assistant' : ''),
  isSender: msg.isSender || false,
  date: msg.date || new Date().toISOString(),
  streaming: context === 'event' ? msg.streaming || false : msg.streaming,
  llmId: msg.llmId,
  cost: msg.cost,
  inputTokens: msg.inputTokens,
  outputTokens: msg.outputTokens,
  feedbackType: msg.feedbackType,
  feedbackText: msg.feedbackText,
  isEdited: msg.isEdited,
  isRegenerated: msg.isRegenerated,
  originalMessage: msg.originalMessage,
});

// ════════════════════════════════════════════════════════════════════════════
// Store
// ════════════════════════════════════════════════════════════════════════════

export const usePublicWebSocketStore = create<PublicWebSocketStore>()(
  subscribeWithSelector((set, get) => {
    const core = createChatSocketCore<PublicBotMessage>(set, get, {
      service: publicSocketService,
      // Lazy import to avoid a circular dependency with publicBotStore
      resolveTarget: async () => {
        const { usePublicBotStore } = await import('./publicBotStore');
        const publicBotStore = usePublicBotStore.getState();
        return {
          setHistory: publicBotStore.setMessages,
          addMessage: publicBotStore.addMessage,
          updateMessage: publicBotStore.updateMessage,
          getMessages: () => usePublicBotStore.getState().messages,
          setIsTyping: publicBotStore.setIsTyping,
        };
      },
      mapMessage: mapToPublicBotMessage,
      // A completed assistant message means a fresh assessment is coming:
      // clear old progress and show the tracker loading state
      onCompleteAssistantMessage: () => {
        set({
          progressTokens: [],
          progressContent: '',
          isProgressStreaming: true,
        });
      },
      // A new AI response starting invalidates the previous assessment
      onStreamStart: () => {
        get().clearProgressTokens();
      },
    });

    return {
      ...initialState,
      ...core,

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

        core.wireService();

        // Connect to conversation with session ID (auto-subscribes on backend)
        publicSocketService.connectWithSession(sessionId, conversationId);
      },

      disconnect: () => {
        publicSocketService.disconnect();
        publicSocketService.clearHandlers();
        set(initialState);
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
        publicSocketService.sendMessage(payload, error =>
          core.handleSocketMessage({ type: 'error', errorMessage: error })
        );
      },
    };
  })
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
