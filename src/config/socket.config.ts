import {
  CHAT_SOCKET_NAMESPACE,
  CHAT_SOCKET_PATH,
  CHAT_TRANSPORTS,
  type ChatSocketAuth,
} from '@cmudco/chat-socket-contract';

/**
 * Socket.IO Configuration for Socratic Books
 *
 * Configures connection to DARE backend Socket.IO server.
 *
 * Supports two authentication modes:
 * - JWT Token (authenticated users): { token: 'jwt_token' }
 * - Session ID (public bots): { sessionId: 'uuid', conversationId: 'uuid' }
 */

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

export type SocketAuth = ChatSocketAuth;

// ════════════════════════════════════════════════════════════════════════════
// Configuration
// ════════════════════════════════════════════════════════════════════════════

/**
 * Socket.IO connection configuration
 */
export const socketConfig = {
  /**
   * Base URL for Socket.IO connection
   * Uses VITE_DARE_SOCKET_URL environment variable
   * Falls back to localhost for development
   */
  get baseUrl(): string {
    const url = import.meta.env.VITE_DARE_SOCKET_URL || 'http://localhost:8000';
    // Remove trailing slash if present
    return url.replace(/\/$/, '');
  },

  /**
   * Socket.IO path (where socket.io server is mounted)
   */
  path: CHAT_SOCKET_PATH,

  /**
   * Namespace for chat functionality
   */
  namespace: CHAT_SOCKET_NAMESPACE,

  /**
   * Transport methods in order of preference
   * WebSocket is preferred, polling as fallback
   */
  transports: CHAT_TRANSPORTS,

  /**
   * Reconnection settings
   */
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
} as const;

/**
 * Build full Socket.IO URL with namespace
 */
export function getSocketUrl(): string {
  return `${socketConfig.baseUrl}${socketConfig.namespace}`;
}

/**
 * Get Socket.IO connection options
 * Works with both JWT and session-based auth
 *
 * Note: Platform detection (DARE vs SocraticBots) is handled automatically
 * by the DARE backend using the Origin/Referer headers from the request.
 */
export function getSocketOptions(auth: SocketAuth) {
  return {
    path: socketConfig.path,
    auth,
    transports: [...socketConfig.transports],
    reconnection: socketConfig.reconnection,
    reconnectionAttempts: socketConfig.reconnectionAttempts,
    reconnectionDelay: socketConfig.reconnectionDelay,
    reconnectionDelayMax: socketConfig.reconnectionDelayMax,
  };
}

export default socketConfig;
