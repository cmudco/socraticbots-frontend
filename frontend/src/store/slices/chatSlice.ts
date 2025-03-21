// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chapter, ChatMessage } from '../../services/chat.service';

interface ChatState {
  availableChapters: Chapter[];
  selectedChapterId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  availableChapters: [],
  selectedChapterId: null,
  messages: [],
  isStreaming: false,
  loading: false,
  error: null
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
      // Reset messages when changing chapters
      state.messages = [];
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateLastMessage: (state, action: PayloadAction<string>) => {
      if (state.messages.length > 0) {
        const lastMessage = state.messages[state.messages.length - 1];
        state.messages[state.messages.length - 1] = {
          ...lastMessage,
          content: action.payload
        };
      }
    },
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearMessages: (state) => {
      state.messages = [];
    }
  }
});

export const { 
  setLoading, 
  setAvailableChapters, 
  setSelectedChapter,
  addMessage,
  updateLastMessage,
  setStreaming,
  setError,
  clearMessages
} = chatSlice.actions;

export default chatSlice.reducer;
