// src/stores/authStore.ts
import { create } from 'zustand';
import type { AuthState, User, AuthTokens } from '../types/auth';

interface AuthStore extends AuthState {
  setAuth: (authData: {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  // Actions
  setAuth: (authData) =>
    set({
      user: authData.user,
      tokens: authData.tokens,
      isAuthenticated: authData.isAuthenticated,
      isLoading: authData.isLoading,
    }),

  clearAuth: () =>
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) =>
    set((state) => ({
      ...state,
      isLoading: loading,
    })),

  setUser: (user) =>
    set((state) => ({
      ...state,
      user,
    })),

  setTokens: (tokens) =>
    set((state) => ({
      ...state,
      tokens,
      isAuthenticated: !!tokens,
    })),
}));
