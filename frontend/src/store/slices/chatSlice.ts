// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chapter } from '../../services/chat.service';

// Define what our chat state will look like
interface ChatState {
  availableChapters: Chapter[];
  selectedChapterId: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state when the app first loads
const initialState: ChatState = {
  availableChapters: [],
  selectedChapterId: null,
  loading: false,
  error: null
};

// Create the slice with reducers to modify the state
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // When we start loading chapters
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // When chapters are successfully loaded
    setAvailableChapters: (state, action: PayloadAction<Chapter[]>) => {
      state.availableChapters = action.payload;
      state.loading = false;
    },
    
    // When user selects a chapter from dropdown
    setSelectedChapter: (state, action: PayloadAction<string | null>) => {
      state.selectedChapterId = action.payload;
    },
    
    // When there's an error loading chapters
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

// Export the actions to use in our components
export const { 
  setLoading, 
  setAvailableChapters, 
  setSelectedChapter, 
  setError 
} = chatSlice.actions;

// Export the reducer to add to our store
export default chatSlice.reducer;
