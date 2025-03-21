// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chapter } from '../../services/chat.service';
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
  // Add these states for message sending
  messageSending: boolean;
  messageError: string | null;
}

const initialState: ChatState = {
  availableChapters: [],
  selectedChapterId: null,
  loading: false,
  error: null,
  conversation: null,
  conversationLoading: false,
  conversationError: null,
  // Add initial values for new states
  messageSending: false,
  messageError: null,
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
      })
      .addCase(fetchConversationForChapter.rejected, (state, action) => {
        state.conversationLoading = false;
        state.conversationError = action.payload as string;
      })
      
    // Handle sendChatMessage states
      .addCase(sendChatMessage.pending, (state) => {
        state.messageSending = true;
        state.messageError = null;
      })
      .addCase(sendChatMessage.fulfilled, (state) => {
        state.messageSending = false;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.messageSending = false;
        state.messageError = action.payload as string;
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
  clearMessageError
} = chatSlice.actions;

export default chatSlice.reducer;
