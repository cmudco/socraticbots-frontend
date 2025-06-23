// src/store/slices/apiSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface ApiState {
  isReady: boolean;
}

const initialState: ApiState = {
  isReady: false,
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setApiReady: (state) => {
      state.isReady = true;
    },
    resetApiState: (state) => {
      state.isReady = false;
    },
  },
});

export const { setApiReady, resetApiState } = apiSlice.actions;
export default apiSlice.reducer;
