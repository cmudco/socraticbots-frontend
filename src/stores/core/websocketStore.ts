import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  socket: WebSocket | null;
  
  // Progress streaming state
  isProgressStreaming: boolean;
  progressTokens: string[];
  progressContent: string;
}

export interface WebSocketActions {
  // Connection management
  connect: (socketUrl: string) => Promise<void>;
  disconnect: () => void;
  setError: (error: string | null) => void;
  
  // Progress streaming actions
  setProgressStreaming: (streaming: boolean) => void;
  addProgressToken: (token: string) => void;
  clearProgressTokens: () => void;
  setProgressContent: (content: string) => void;
  
  // Message sending
  sendMessage: (payload: any) => void;
}

type WebSocketStore = WebSocketState & WebSocketActions;

const initialState: WebSocketState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  socket: null,
  isProgressStreaming: false,
  progressTokens: [],
  progressContent: '',
};

export const useWebSocketStore = create<WebSocketStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    connect: async (socketUrl: string) => {
      const { isConnecting, isConnected } = get();
      if (isConnecting || isConnected) return;

      try {
        set({ isConnecting: true, error: null });

        const socket = new WebSocket(socketUrl);

        socket.onopen = () => {
          set({ 
            isConnected: true, 
            isConnecting: false, 
            socket,
            error: null
          });
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          set({ 
            error: 'WebSocket connection error',
            isConnecting: false,
            isConnected: false
          });
        };

        socket.onclose = () => {
          set({ 
            isConnected: false, 
            isConnecting: false,
            socket: null
          });
        };

        // Note: onmessage will be handled by the conversation store
        // which will subscribe to WebSocket events and route them appropriately

      } catch (error) {
        console.error('Error connecting WebSocket:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          isConnecting: false 
        });
      }
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.close();
      }
      set(initialState);
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setProgressStreaming: (streaming: boolean) => {
      set({ isProgressStreaming: streaming });
      if (!streaming) {
        // Compile final content from tokens when streaming ends
        const { progressTokens } = get();
        set({ progressContent: progressTokens.join('') });
      }
    },

    addProgressToken: (token: string) => {
      set(state => ({ 
        progressTokens: [...state.progressTokens, token] 
      }));
    },

    clearProgressTokens: () => {
      set({ 
        progressTokens: [], 
        progressContent: '',
        isProgressStreaming: false 
      });
    },

    setProgressContent: (content: string) => {
      set({ progressContent: content });
    },

    sendMessage: (payload: any) => {
      const { socket, isConnected } = get();
      if (!socket || !isConnected) {
        console.error('Cannot send message: WebSocket not connected');
        return;
      }
      
      try {
        socket.send(JSON.stringify(payload));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        set({ error: 'Failed to send message' });
      }
    },
  }))
);

// Selector hooks for better performance - use individual selectors to avoid object recreation
export const useIsWebSocketConnected = () => useWebSocketStore(state => state.isConnected);
export const useIsWebSocketConnecting = () => useWebSocketStore(state => state.isConnecting);
export const useWebSocketError = () => useWebSocketStore(state => state.error);

export const useIsProgressStreaming = () => useWebSocketStore(state => state.isProgressStreaming);
export const useProgressTokens = () => useWebSocketStore(state => state.progressTokens);
export const useProgressContent = () => useWebSocketStore(state => state.progressContent);
