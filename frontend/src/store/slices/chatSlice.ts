// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chapter } from '../../services/chat.service';
import { Conversation } from '../../services/chat.service';

interface ChatState {
  availableChapters: Chapter[];
  selectedChapterId: string | null;
  loading: boolean;
  error: string | null;
  conversation: Conversation | null;
  conversationLoading: boolean;
  conversationError: string | null;
}

const initialState: ChatState = {
  availableChapters: [],
  selectedChapterId: null,
  loading: false,
  error: null,
  conversation: null,
  conversationLoading: false,
  conversationError: null,
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
}
});

export const { 
  setLoading, 
  setAvailableChapters, 
  setSelectedChapter,
  setError,
  setConversation, 
  setConversationLoading, 
  setConversationError 
} = chatSlice.actions;

export default chatSlice.reducer;
