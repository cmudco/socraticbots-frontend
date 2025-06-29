// src/stores/uiStore.ts
import { create } from 'zustand';

interface UiStore {
  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUiStore = create<UiStore>(set => ({
  // Initial state
  sidebarCollapsed: false,

  // Actions
  toggleSidebar: () =>
    set(state => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),

  setSidebarCollapsed: collapsed =>
    set({
      sidebarCollapsed: collapsed,
    }),
}));
