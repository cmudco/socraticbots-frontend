// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chapter, ChatMessage } from '../../services/chat.service';
import { Conversation } from '../../services/chat.service';
import { fetchAvailableChapters, fetchConversationForChapter, sendChatMessage } from '../thunks/chatThunks';

interface ChatState {
  availableChapters: Chapter[];
  selectedChapterId: string | null;
  loading: boolean;
  error: string | null;
  conversation: Conversation | null;
  conversationLoading: boolean;
  conversationError: string | null;
  // Message sending states
  messageSending: boolean;
  messageError: string | null;
  // Pending message state for immediate UI updates
  pendingUserMessage: ChatMessage | null;
  // New streaming states
  isStreaming: boolean;
  streamingError: string | null;
  pendingAssistantMessage: ChatMessage | null;
  // Tracking States
  trackingProgress: boolean;
  trackingError: string | null;
  trackingResult: string | null;
}

const initialState: ChatState = {
  availableChapters: [],
  selectedChapterId: null,
  loading: false,
  error: null,
  conversation: null,
  conversationLoading: false,
  conversationError: null,
  messageSending: false,
  messageError: null,
  pendingUserMessage: null,
  isStreaming: false,
  streamingError: null,
  pendingAssistantMessage: null,
  trackingProgress: false,
  trackingError: null,
  trackingResult: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAvailableChapters: (state, action: PayloadAction<Chapter[]>) => {
      state.availableChapters = action.payload;
      state.loading = false;
    },
    setSelectedChapter: (state, action: PayloadAction<string | null>) => {
      state.selectedChapterId = action.payload;
      state.trackingResult = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.conversation = action.payload;
    },
    setConversationLoading: (state, action: PayloadAction<boolean>) => {
      state.conversationLoading = action.payload;
    },
    setConversationError: (state, action: PayloadAction<string | null>) => {
      state.conversationError = action.payload;
    },
    clearMessageError: (state) => {
      state.messageError = null;
    },
    // New reducers for handling pending messages
    addPendingUserMessage: (state, action: PayloadAction<string>) => {
      state.pendingUserMessage = {
        id: 'pending-' + Date.now(),
        role: 'user',
        content: action.payload,
        created_at: new Date().toISOString()
      };
    },
    clearPendingUserMessage: (state) => {
      state.pendingUserMessage = null;
    },
    // New streaming reducers
    startStreaming: (state) => {
      state.isStreaming = true;
      state.streamingError = null;
      // Initialize empty assistant message
      state.pendingAssistantMessage = {
        id: 'streaming-' + Date.now(),
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      };
    },

    updateStreamingMessage: (state, action: PayloadAction<string>) => {
      if (!state.pendingAssistantMessage) {
        // Create new streaming message if none exists
        state.pendingAssistantMessage = {
          id: 'streaming-' + Date.now(),
          role: 'assistant',
          content: action.payload,
          created_at: new Date().toISOString()
        };
      } else {
        // Append to existing streaming message
        state.pendingAssistantMessage.content += action.payload;
      }
    },

    completeStreaming: (state) => {
      state.isStreaming = false;
      // If we have a conversation and a complete streaming message, add it
      if (state.conversation && state.pendingAssistantMessage) {
        state.conversation.messages.push({
          ...state.pendingAssistantMessage,
          id: 'msg-' + Date.now() // Generate a proper ID
        });
      }
      state.pendingAssistantMessage = null;
    },

    setStreamingError: (state, action: PayloadAction<string>) => {
      state.isStreaming = false;
      state.streamingError = action.payload;
      state.pendingAssistantMessage = null;
    },
    startTracking: (state) => {
      state.trackingProgress = true;
      state.trackingError = null;
      // Clear previous tracking result
      state.trackingResult = null;
    },
    clearTrackingResult: (state) => {
      state.trackingResult = null;
    },
    setTrackingResult: (state, action: PayloadAction<string>) => {
      state.trackingProgress = false;
      state.trackingResult = (state.trackingResult || '') + action.payload;
      state.trackingError = null;
    },
    
    setTrackingError: (state, action: PayloadAction<string>) => {
      state.trackingProgress = false;
      state.trackingError = action.payload;
    },
    
    clearTracking: (state) => {
      state.trackingProgress = false;
      state.trackingError = null;
      state.trackingResult = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchAvailableChapters states
    builder
      .addCase(fetchAvailableChapters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableChapters.fulfilled, (state, action) => {
        state.loading = false;
        state.availableChapters = action.payload;
      })
      .addCase(fetchAvailableChapters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
    // Handle fetchConversationForChapter states
      .addCase(fetchConversationForChapter.pending, (state) => {
        state.conversationLoading = true;
        state.conversationError = null;
      })
      .addCase(fetchConversationForChapter.fulfilled, (state, action) => {
        state.conversationLoading = false;
        state.conversation = action.payload;
        // Clear any pending message as we now have the official one from the server
        state.pendingUserMessage = null;
      })
      .addCase(fetchConversationForChapter.rejected, (state, action) => {
        state.conversationLoading = false;
        state.conversationError = action.payload as string;
      })
      
    // Handle sendChatMessage states
      .addCase(sendChatMessage.pending, (state) => {
        state.messageSending = true;
        state.messageError = null;
        // We don't clear pendingUserMessage here because we want to show it while sending
      })
      .addCase(sendChatMessage.fulfilled, (state) => {
        state.messageSending = false;
        // We'll leave the pending message until the conversation refresh brings in the real one
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.messageSending = false;
        state.messageError = action.payload as string;
        // Even on error, keep the pending message visible to the user
      });
  }
});

export const { 
  setLoading, 
  setAvailableChapters, 
  setSelectedChapter,
  setError,
  setConversation, 
  setConversationLoading, 
  setConversationError,
  clearMessageError,
  // Export the new actions
  addPendingUserMessage,
  clearPendingUserMessage,
  startStreaming,
  updateStreamingMessage,
  completeStreaming,
  setStreamingError,
  startTracking,
  setTrackingResult,
  setTrackingError,
  clearTracking,
  clearTrackingResult,
} = chatSlice.actions;

export default chatSlice.reducer;
