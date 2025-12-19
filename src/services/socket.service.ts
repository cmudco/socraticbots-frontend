/**
 * Socket.IO Service for Socratic Books (Authenticated Users Only)
 *
 * Provides Socket.IO connection management for authenticated bot conversations.
 * This service is designed to be used by Zustand stores, adapting DARE's Redux middleware pattern.
 *
 * Architecture:
 * - Single connection per user session (connects on login via ProtectedRoute)
 * - Room-based conversation subscriptions
 * - Fire-and-forget pattern with optional callbacks (no Promises)
 *
 * NOTE: Public bots use raw WebSocket via publicWebSocket.service.ts
 * because DARE backend's Socket.IO namespace only supports JWT authentication.
 */
import { getSocketOptions, getSocketUrl, socketConfig } from '@/config/socket.config';
import { Socket, io } from 'socket.io-client';

import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketMessage,
  SocketPlatform,
} from '@/types/socket';

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type MessageHandler = (data: SocketMessage) => void;
export type ConnectionHandler = (connected: boolean) => void;
export type ErrorHandler = (error: string) => void;

// ════════════════════════════════════════════════════════════════════════════
// Socket Service Class
// ════════════════════════════════════════════════════════════════════════════

/**
 * Socket.IO service class for managing real-time connections
 */
class SocketService {
  private socket: TypedSocket | null = null;
  private subscriptions = new Set<string>();
  private platform: SocketPlatform;

  // Event handlers set by Zustand stores
  private messageHandler: MessageHandler | null = null;
  private connectionHandler: ConnectionHandler | null = null;
  private errorHandler: ErrorHandler | null = null;

  constructor(platform: SocketPlatform) {
    this.platform = platform;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Connection Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Connect with JWT token (for authenticated users)
   */
  connectWithToken(token: string): void {
    this.connect({ token });
  }

  /**
   * Internal connection setup
   */
  private connect(auth: { token: string }): void {
    // Already connected
    if (this.socket?.connected) {
      console.log(`[SocketService] Already connected for ${this.platform}`);
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const socketUrl = getSocketUrl();
    const options = getSocketOptions(auth);

    console.log(`[SocketService] Connecting to ${socketUrl} for ${this.platform}`);

    this.socket = io(socketUrl, options) as TypedSocket;

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log(`[SocketService] Connected for ${this.platform}`);
      this.connectionHandler?.(true);

      // Re-subscribe to all tracked conversations on reconnect
      this.subscriptions.forEach(convId => {
        this.subscribeInternal(convId);
      });
    });

    this.socket.on('disconnect', reason => {
      console.log(`[SocketService] Disconnected for ${this.platform}:`, reason);
      this.connectionHandler?.(false);
    });

    this.socket.on('connect_error', error => {
      console.error(`[SocketService] Connection error for ${this.platform}:`, error.message);
      this.errorHandler?.(error.message);
    });

    // Forward all messages to handler
    this.socket.on('message', (data: SocketMessage) => {
      this.messageHandler?.(data);
    });
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.socket) {
      console.log(`[SocketService] Disconnecting for ${this.platform}`);
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscriptions.clear();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Subscription Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Subscribe to a conversation room
   * Fire-and-forget with optional callbacks
   */
  subscribe(
    conversationId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): void {
    if (!this.socket?.connected) {
      console.warn('[SocketService] Cannot subscribe: not connected');
      onError?.('Not connected');
      return;
    }

    // Track subscription optimistically
    this.subscriptions.add(conversationId);

    this.socket.emit(
      'subscribe_conversation',
      { conversationId, platform: this.platform },
      response => {
        if (response.success) {
          console.log(`[SocketService] Subscribed to ${conversationId}`);
          onSuccess?.();
        } else {
          console.error(`[SocketService] Subscribe failed:`, response.error);
          this.subscriptions.delete(conversationId);
          onError?.(response.error || 'Subscribe failed');
        }
      }
    );
  }

  /**
   * Internal subscribe (used for re-subscription on reconnect)
   */
  private subscribeInternal(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit(
      'subscribe_conversation',
      { conversationId, platform: this.platform },
      response => {
        if (!response.success) {
          console.error(
            `[SocketService] Re-subscribe failed for ${conversationId}:`,
            response.error
          );
        }
      }
    );
  }

  /**
   * Unsubscribe from a conversation room
   * Fire-and-forget with optional callback
   */
  unsubscribe(conversationId: string, onComplete?: () => void): void {
    // Remove from tracked subscriptions immediately
    this.subscriptions.delete(conversationId);

    if (!this.socket?.connected) {
      onComplete?.();
      return;
    }

    this.socket.emit('unsubscribe_conversation', { conversationId }, () => {
      console.log(`[SocketService] Unsubscribed from ${conversationId}`);
      onComplete?.();
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Message Methods
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Send a message to the server
   * Fire-and-forget with optional error callback
   */
  sendMessage(payload: Record<string, unknown>, onError?: (error: string) => void): void {
    if (!this.socket?.connected) {
      console.warn('[SocketService] Cannot send message: not connected');
      onError?.('Not connected');
      return;
    }

    this.socket.emit('send_message', payload, response => {
      if (!response.success) {
        console.error('[SocketService] Send message failed:', response.error);
        onError?.(response.error || 'Send failed');
      }
    });
  }

  /**
   * Edit an existing message
   * Fire-and-forget with optional error callback
   */
  editMessage(
    conversationId: string,
    messageId: string,
    message: string,
    onError?: (error: string) => void
  ): void {
    if (!this.socket?.connected) {
      onError?.('Not connected');
      return;
    }

    this.socket.emit('edit_message', { conversationId, messageId, message }, response => {
      if (!response.success) {
        console.error('[SocketService] Edit message failed:', response.error);
        onError?.(response.error || 'Edit failed');
      }
    });
  }

  /**
   * Regenerate a response
   * Fire-and-forget with optional error callback
   */
  regenerateResponse(payload: Record<string, unknown>, onError?: (error: string) => void): void {
    if (!this.socket?.connected) {
      onError?.('Not connected');
      return;
    }

    this.socket.emit('regenerate_response', payload, response => {
      if (!response.success) {
        console.error('[SocketService] Regenerate failed:', response.error);
        onError?.(response.error || 'Regenerate failed');
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Event Handler Registration
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Set handler for incoming messages
   */
  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  /**
   * Set handler for connection status changes
   */
  onConnectionChange(handler: ConnectionHandler): void {
    this.connectionHandler = handler;
  }

  /**
   * Set handler for errors
   */
  onError(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

  /**
   * Clear all event handlers
   */
  clearHandlers(): void {
    this.messageHandler = null;
    this.connectionHandler = null;
    this.errorHandler = null;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // State Getters
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get current subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Singleton Instance
// ════════════════════════════════════════════════════════════════════════════

/**
 * Socket service for authenticated users (uses JWT)
 * Public bots use raw WebSocket via publicWebSocket.service.ts
 */
export const authenticatedSocketService = new SocketService(socketConfig.platforms.authenticated);

export { SocketService };
export default authenticatedSocketService;
