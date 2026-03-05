import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import type { PlatformRole } from '@/types/auth';

export interface User {
  id: number;
  email: string;
  name: string;
  isCreator: boolean;
  hasSupervisorAccessForVoiceAgent: boolean;
  platformRole?: PlatformRole;
  externalUserId: number;
  isActive: boolean;
  dateJoined: string;
  platform: string;
  chunkSize?: number;
  overlapSize?: number;
}

class UserService {
  async getUserInfo(): Promise<User> {
    return baseRequest<User>({
      url: 'users/user-info/',
      method: METHOD.GET,
    });
  }

  logout(): void {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Redirect to login
    window.location.href = '/login';
  }
}

export const userService = new UserService();
