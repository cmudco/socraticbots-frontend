// src/types/auth.ts
export interface User {
    id: number;
    username: string;
    email: string;
    // Add any other user fields you need
  }
  
  export interface AuthTokens {
    access: string;
    refresh: string;
  }
  
  export interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  