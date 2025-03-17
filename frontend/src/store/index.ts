// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './slices/sidebarSlice';
import apiReducer from './slices/apiSlice';
import chapterFormReducer from './slices/chapterFormSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    api: apiReducer,
    chapterForm: chapterFormReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
