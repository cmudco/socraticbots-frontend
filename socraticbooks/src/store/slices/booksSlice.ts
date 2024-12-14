// src/store/slices/booksSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { Book } from '../../types/book';

// Define what our books state looks like
interface BooksState {
  books: Book[];
}

// Set initial state
const initialState: BooksState = {
  books: []
};

// Create the slice
const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    // We'll add actions here later
  }
});

export default booksSlice.reducer;