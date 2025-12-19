/**
 * Socket.IO Configuration for Socratic Books (Authenticated Users Only)
 *
 * Configures connection to DARE backend Socket.IO server.
 *
 * NOTE: Public bots use raw WebSocket (Django Channels) instead of Socket.IO
 * because DARE backend's Socket.IO /chat namespace only supports JWT auth.
 */

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
  path: '/socket.io/',

  /**
   * Namespace for chat functionality
   */
  namespace: '/chat',

  /**
   * Transport methods in order of preference
   * WebSocket is preferred, polling as fallback
   */
  transports: ['websocket', 'polling'] as const,

  /**
   * Reconnection settings
   */
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,

  /**
   * Platform identifier for subscription events
   */
  platforms: {
    authenticated: 'SOCRATIC_BOOKS',
  } as const,
} as const;

/**
 * Build full Socket.IO URL with namespace
 */
export function getSocketUrl(): string {
  return `${socketConfig.baseUrl}${socketConfig.namespace}`;
}

/**
 * Get Socket.IO connection options for authenticated users
 */
export function getSocketOptions(auth: { token: string }) {
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
