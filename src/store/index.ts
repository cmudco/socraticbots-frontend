// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    // Only keep chat reducer since chat module hasn't been migrated yet
    // Sidebar, API, chapters, and chapter form have been migrated to Zustand + TanStack Query
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
