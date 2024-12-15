// src/store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit'
import booksReducer from './slices/booksSlice';
import chaptersReducer from './slices/chaptersSlice';

const rootReducer = combineReducers({
  books: booksReducer,
  chapters: chaptersReducer
})

export default rootReducer