// src/store/slices/chaptersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chapter } from '../../services/chapters.service';
import { createChapter, updateChapter } from '../thunks/chapterThunks';

interface ChaptersState {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
  currentBookId: string | null;
}

const initialState: ChaptersState = {
  chapters: [],
  loading: false,
  error: null,
  currentBookId: null
};

const chaptersSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    setChapters: (state, action: PayloadAction<Chapter[]>) => {
      state.chapters = action.payload;
    },
    setCurrentBookId: (state, action: PayloadAction<string>) => {
      state.currentBookId = action.payload;
    },
    removeChapter: (state, action: PayloadAction<string>) => {
      state.chapters = state.chapters.filter(chapter => chapter.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // Create Chapter
    builder.addCase(createChapter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createChapter.fulfilled, (state, action) => {
      state.loading = false;
      state.chapters.push(action.payload);
    });
    builder.addCase(createChapter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update Chapter
    builder.addCase(updateChapter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateChapter.fulfilled, (state, action) => {
      state.loading = false;
      // Replace the updated chapter in the array
      const index = state.chapters.findIndex(ch => ch.id === action.payload.id);
      if (index !== -1) {
        state.chapters[index] = action.payload;
      }
    });
    builder.addCase(updateChapter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setChapters, setCurrentBookId, removeChapter } = chaptersSlice.actions;

export default chaptersSlice.reducer;
