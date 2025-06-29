// src/services/auth.service.ts
import { METHOD } from '../constants/requests';
import { AuthTokens, User } from '../types/auth';
import { baseRequest } from '../utils/baseRequest';

class AuthService {
  // Check if a token is valid
  async validateToken(token: string): Promise<boolean> {
    try {
      await baseRequest({
        url: 'users/token/verify/',
        method: METHOD.POST,
        data: { token },
        includeAuthToken: false,
      });
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Login and get tokens
  async login(username: string, password: string): Promise<AuthTokens> {
    return baseRequest<AuthTokens>({
      url: 'users/token/',
      method: METHOD.POST,
      data: { username, password },
      includeAuthToken: false,
    });
  }

  // Refresh tokens
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const data = await baseRequest<AuthTokens>({
        url: 'users/token/refresh/',
        method: METHOD.POST,
        data: { refresh: refreshToken },
        includeAuthToken: false,
      });

      // Check if we got a new refresh token
      const newRefreshToken = data.refresh || refreshToken;

      return {
        access: data.access,
        refresh: newRefreshToken,
      };
    } catch (error) {
      console.error('Token refresh failed with exception:', error);
      throw error;
    }
  }

  // Fetch user profile
  async fetchUserProfile(): Promise<User> {
    return baseRequest<User>({
      url: 'users/me/',
      method: METHOD.GET,
    });
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    await baseRequest({
      url: 'users/change-password/',
      method: METHOD.POST,
      data: {
        old_password: oldPassword,
        new_password: newPassword,
      },
    });
    return true;
  }
}

export const authService = new AuthService();
