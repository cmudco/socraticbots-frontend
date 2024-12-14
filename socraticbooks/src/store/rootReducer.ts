// src/store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit'
import booksReducer from './slices/booksSlice';

const rootReducer = combineReducers({
  books: booksReducer
})

export default rootReducer