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
  clearPendingUserMessage
} = chatSlice.actions;

export default chatSlice.reducer;
