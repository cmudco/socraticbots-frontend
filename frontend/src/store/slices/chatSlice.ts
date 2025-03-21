// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chapter } from '../../services/chat.service';

interface ChatState {
  availableChapters: Chapter[];
  selectedChapterId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  availableChapters: [],
  selectedChapterId: null,
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
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { 
  setLoading, 
  setAvailableChapters, 
  setSelectedChapter, 
  setError 
} = chatSlice.actions;

export default chatSlice.reducer;
