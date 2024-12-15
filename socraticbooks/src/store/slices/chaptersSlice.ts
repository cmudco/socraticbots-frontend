import { createSlice } from '@reduxjs/toolkit';

interface Chapter {
  id: string;
  title: string;
  book_id: string;
  created_at: string;
  updated_at: string;
}

interface ChaptersState {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
}

const initialState: ChaptersState = {
  chapters: [],
  loading: false,
  error: null
};

const chaptersSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    // Fetch chapters for a book
    fetchChaptersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchChaptersSuccess: (state, action) => {
      state.chapters = action.payload;
      state.loading = false;
    },
    fetchChaptersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Add new chapter
    addChapterStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addChapterSuccess: (state, action) => {
      state.chapters.unshift(action.payload);
      state.loading = false;
    },
    addChapterFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchChaptersStart,
  fetchChaptersSuccess,
  fetchChaptersFailure,
  addChapterStart,
  addChapterSuccess,
  addChapterFailure
} = chaptersSlice.actions;

export default chaptersSlice.reducer;