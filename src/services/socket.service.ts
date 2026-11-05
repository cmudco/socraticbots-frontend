/**
 * Socket.IO Service for Socratic Bots
 *
 * Provides Socket.IO connection management for bot conversations.
 * This service is designed to be used by Zustand stores, adapting DARE's Redux middleware pattern.
 *
 * Architecture:
 * - Single connection per user session (authenticated) or per conversation (public)
 * - Room-based conversation subscriptions
 * - Fire-and-forget pattern with optional callbacks (no Promises)
 *
 * Authentication Modes:
 * - JWT Token (authenticated users): connectWithToken(token)
 * - Session ID (public bots): connectWithSession(sessionId, conversationId)
 */
import { type SocketAuth, getSocketOptions, getSocketUrl } from '@/config/socket.config';
import { Socket, io } from 'socket.io-client';

import type {
  ClientToServerEvents,
  SendMessagePayload,
  ServerToClientEvents,
  SocketMessage,
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
 *
 * Platform detection (DARE vs SocraticBots) is handled automatically
 * by the DARE backend using Origin header at connection time.
 */
class SocketService {
  private socket: TypedSocket | null = null;
  private subscriptions = new Set<string>();

  // Event handlers set by Zustand stores
  private messageHandler: MessageHandler | null = null;
  private connectionHandler: ConnectionHandler | null = null;
  private errorHandler: ErrorHandler | null = null;

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
   * Connect with session ID (for public/anonymous users)
   * Public bots are auto-subscribed on connect, no separate subscribe needed.
   */
  connectWithSession(sessionId: string, conversationId: string): void {
    this.connect({ sessionId, conversationId });
  }

  /**
   * Internal connection setup
   * Supports both JWT and session-based auth
   */
  private connect(auth: SocketAuth): void {
    // Already connected
    if (this.socket?.connected) {
      console.log('[SocketService] Already connected');
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const socketUrl = getSocketUrl();
    const options = getSocketOptions(auth);

    console.log(`[SocketService] Connecting to ${socketUrl}`);

    this.socket = io(socketUrl, options) as TypedSocket;

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('[SocketService] Connected');
      this.connectionHandler?.(true);

      // Re-subscribe to all tracked conversations on reconnect (only for JWT auth)
      // Public bots are auto-subscribed on connect, so they don't need this
      if ('token' in auth) {
        this.subscriptions.forEach(convId => {
          this.subscribeInternal(convId);
        });
      }
    });

    this.socket.on('disconnect', reason => {
      console.log(`[SocketService] Disconnected: ${reason}`);
      this.connectionHandler?.(false);
    });

    this.socket.on('connect_error', error => {
      console.error(`[SocketService] Connection error: ${error.message}`);
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
      console.log('[SocketService] Disconnecting');
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

    // Platform is detected by backend via Origin header - not sent from client
    this.socket.emit('subscribe_conversation', { conversationId }, response => {
      if (response.success) {
        console.log(`[SocketService] Subscribed to ${conversationId}`);
        onSuccess?.();
      } else {
        console.error(`[SocketService] Subscribe failed:`, response.error);
        this.subscriptions.delete(conversationId);
        onError?.(response.error || 'Subscribe failed');
      }
    });
  }

  /**
   * Internal subscribe (used for re-subscription on reconnect)
   */
  private subscribeInternal(conversationId: string): void {
    if (!this.socket?.connected) return;

    // Platform is detected by backend via Origin header - not sent from client
    this.socket.emit('subscribe_conversation', { conversationId }, response => {
      if (!response.success) {
        console.error(`[SocketService] Re-subscribe failed for ${conversationId}:`, response.error);
      }
    });
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
  sendMessage(payload: SendMessagePayload, onError?: (error: string) => void): void {
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

  /** Cancel through DARE; the final message event carries the saved partial reply. */
  stopGeneration(conversationId: string, onResult: (error: string | null) => void): void {
    if (!this.socket?.connected) {
      onResult('Not connected. Reconnect before stopping the response.');
      return;
    }
    this.socket.timeout(10000).emit('stop_generation', { conversationId }, (error, response) => {
      if (error) {
        onResult('The stop request was not acknowledged. Please try again.');
      } else if (!response.success) {
        onResult(response.error || 'The response could not be stopped. Please try again.');
      } else {
        onResult(null);
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
// Singleton Instances
// ════════════════════════════════════════════════════════════════════════════

/**
 * Socket service for authenticated users (uses JWT)
 * Connects on login via useSocketConnection hook
 */
export const authenticatedSocketService = new SocketService();

/**
 * Socket service for public/anonymous users (uses session ID)
 * Connects when conversation is available via PublicBotChat
 */
export const publicSocketService = new SocketService();

export { SocketService };
export default authenticatedSocketService;
