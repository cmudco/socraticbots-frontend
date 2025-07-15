// src/types/auth.ts
export interface User {
  id: number;
  email: string;
  name: string;
  is_professor: boolean;
  external_user_id?: number;
  is_active: boolean;
  date_joined?: string;
  platform: string;
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
