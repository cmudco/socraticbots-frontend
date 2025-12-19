/**
 * Hook for managing Socket.IO connection lifecycle
 *
 * This hook should be used at the top level of authenticated routes
 * (via ProtectedRoute) to establish and maintain the Socket.IO connection.
 *
 * Connection is established when:
 * - User is authenticated (has valid token)
 * - Not already connected
 *
 * Connection is cleaned up when:
 * - User logs out (component unmounts)
 */
import { useEffect } from 'react';

import { useWebSocketStore } from '@/stores/core/websocketStore';

export const useSocketConnection = () => {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    // Get current state directly from store - reliable source of truth
    const { isConnected, isConnecting, connect } = useWebSocketStore.getState();

    // Only connect if not already connected or connecting
    if (!isConnected && !isConnecting) {
      connect(token);
    }

    // Cleanup on unmount only
    return () => {
      const { isConnected: stillConnected, disconnect } = useWebSocketStore.getState();
      if (stillConnected) {
        disconnect();
      }
    };
  }, []); // Empty deps - run once on mount, cleanup on unmount
};
