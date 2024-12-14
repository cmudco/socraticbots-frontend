// src/store/slices/booksSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface Book {
  id: string;
  title: string;
  description: string;
  user_id: string;
}

interface BooksState {
  books: Book[];
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
    addBookStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addBookSuccess: (state, action) => {
      state.books.push(action.payload);
      state.loading = false;
    },
    addBookFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { addBookStart, addBookSuccess, addBookFailure } = booksSlice.actions;
export default booksSlice.reducer;