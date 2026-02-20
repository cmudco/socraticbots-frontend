export type PlatformRole = 'SUPERADMIN' | 'RESEARCHER' | 'USER' | 'CREATOR' | 'SB_USER';

export interface User {
  id: number;
  email: string;
  name: string;
  isCreator: boolean;
  hasAdminAccessForVoiceAgent: boolean;
  platformRole?: PlatformRole;
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
