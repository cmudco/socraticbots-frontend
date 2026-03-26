import type { PlatformRole } from '@/constants/roles';

export type { PlatformRole };

export interface User {
  id: number;
  email: string;
  name: string;
  isCreator: boolean;
  hasSupervisorAccessForVoiceAgent: boolean;
  isVoiceTeamManager: boolean;
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
