export interface User {
  id: number;
  email: string;
  name: string;
  isProfessor: boolean;
  externalUserId?: number;
  isActive: boolean;
  dateJoined?: string;
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
