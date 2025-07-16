import { create } from 'zustand';

import type { AuthState, AuthTokens, User } from '@/types/auth';

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
  initializeAuth: () => void;
}

const getStoredTokens = (): AuthTokens | null => {
  try {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (access && refresh) {
      return { access, refresh };
    }
    return null;
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const setStoredTokens = (tokens: AuthTokens | null) => {
  if (tokens) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  } else {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

const setStoredUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: authData => {
    setStoredTokens(authData.tokens);
    setStoredUser(authData.user);
    set(state => ({
      ...state,
      user: authData.user,
      tokens: authData.tokens,
      isAuthenticated: authData.isAuthenticated,
      isLoading: authData.isLoading,
    }));
  },

  clearAuth: () => {
    setStoredTokens(null);
    setStoredUser(null);
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: loading =>
    set(state => ({
      ...state,
      isLoading: loading,
    })),

  setUser: user => {
    setStoredUser(user);
    set(state => ({
      ...state,
      user,
    }));
  },

  setTokens: tokens => {
    setStoredTokens(tokens);
    set(state => ({
      ...state,
      tokens,
      isAuthenticated: !!tokens,
    }));
  },

  initializeAuth: () => {
    const storedTokens = getStoredTokens();
    const storedUser = getStoredUser();

    set({
      user: storedUser,
      tokens: storedTokens,
      isAuthenticated: !!storedTokens,
      isLoading: false,
    });
  },
}));
