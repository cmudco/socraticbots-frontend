// src/store/slices/sidebarSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface SidebarState {
  isCollapsed: boolean;
}

const initialState: SidebarState = {
  isCollapsed: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.isCollapsed = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed } = sidebarSlice.actions;
export default sidebarSlice.reducer;
