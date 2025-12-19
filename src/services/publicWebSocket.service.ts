/**
 * Public Bot WebSocket Service
 *
 * Manages raw WebSocket connection to DARE backend for public/anonymous bot conversations.
 * Uses Django Channels WebSocket (NOT Socket.IO) with session-based authentication.
 *
 * URL Pattern: ws://localhost:8000/ws/public/conversations/{conversation_id}/?session_id={session_id}
 */
import type { SocketMessage } from '@/types/socket';

type MessageHandler = (data: SocketMessage) => void;
type ConnectionHandler = (connected: boolean) => void;
type ErrorHandler = (error: string) => void;

class PublicWebSocketService {
  private socket: WebSocket | null = null;
  private sessionId: string | null = null;
  private conversationId: string | null = null;
  private messageHandler: MessageHandler | null = null;
  private connectionHandler: ConnectionHandler | null = null;
  private errorHandler: ErrorHandler | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private getBaseUrl(): string {
    // Use the same DARE socket URL but for raw WebSocket
    const url = import.meta.env.VITE_DARE_SOCKET_URL || 'http://localhost:8000';
    // Convert http to ws
    return url.replace(/^http/, 'ws').replace(/\/$/, '');
  }

  /**
   * Connect to a specific conversation with session authentication
   */
  connect(conversationId: string, sessionId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      // Already connected to same conversation
      if (this.conversationId === conversationId && this.sessionId === sessionId) {
        return;
      }
      // Disconnect from current conversation first
      this.disconnect();
    }

    this.conversationId = conversationId;
    this.sessionId = sessionId;

    const url = `${this.getBaseUrl()}/ws/public/conversations/${conversationId}/?session_id=${sessionId}`;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('[PublicWebSocket] Connected to conversation:', conversationId);
        this.reconnectAttempts = 0;
        this.connectionHandler?.(true);
      };

      this.socket.onmessage = event => {
        try {
          const data = JSON.parse(event.data) as SocketMessage;
          this.messageHandler?.(data);
        } catch (error) {
          console.error('[PublicWebSocket] Failed to parse message:', error);
        }
      };

      this.socket.onerror = event => {
        console.error('[PublicWebSocket] Connection error:', event);
        this.errorHandler?.('WebSocket connection error');
      };

      this.socket.onclose = event => {
        console.log('[PublicWebSocket] Connection closed:', event.code, event.reason);
        this.connectionHandler?.(false);

        // Attempt reconnect if not intentionally closed
        if (event.code !== 1000 && this.conversationId && this.sessionId) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('[PublicWebSocket] Failed to create WebSocket:', error);
      this.errorHandler?.('Failed to establish WebSocket connection');
    }
  }

  /**
   * Disconnect from current conversation
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    this.conversationId = null;
    this.sessionId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Send a message to the current conversation
   */
  sendMessage(payload: Record<string, unknown>, onError?: (error: string) => void): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      const error = 'Cannot send message: WebSocket not connected';
      console.error('[PublicWebSocket]', error);
      onError?.(error);
      return;
    }

    try {
      this.socket.send(JSON.stringify(payload));
    } catch (error) {
      const errorMsg = 'Failed to send message';
      console.error('[PublicWebSocket]', errorMsg, error);
      onError?.(errorMsg);
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get current conversation ID
   */
  getCurrentConversationId(): string | null {
    return this.conversationId;
  }

  // Event handlers
  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  onConnectionChange(handler: ConnectionHandler): void {
    this.connectionHandler = handler;
  }

  onError(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

  clearHandlers(): void {
    this.messageHandler = null;
    this.connectionHandler = null;
    this.errorHandler = null;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[PublicWebSocket] Max reconnect attempts reached');
      this.errorHandler?.('Connection lost. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(
      `[PublicWebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      if (this.conversationId && this.sessionId) {
        this.connect(this.conversationId, this.sessionId);
      }
    }, delay);
  }
}

// Export singleton instance
export const publicWebSocketService = new PublicWebSocketService();
