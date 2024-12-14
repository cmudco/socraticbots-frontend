// src/store/slices/booksSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface BooksState {
  books: any[];
  loading: boolean;
  error: string | null;
}

const initialState: BooksState = {
  books: [],
  loading: false,
  error: null
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    fetchBooksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBooksSuccess: (state, action) => {
      state.books = action.payload;
      state.loading = false;
    },
    fetchBooksFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addBookStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addBookSuccess: (state, action) => {
      state.books.unshift(action.payload); // Add to beginning of array
      state.loading = false;
    },
    addBookFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchBooksStart,
  fetchBooksSuccess,
  fetchBooksFailure,
  addBookStart,
  addBookSuccess,
  addBookFailure
} = booksSlice.actions;
export default booksSlice.reducer;