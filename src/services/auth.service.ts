// src/services/auth.service.ts
import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import { AuthTokens, User } from '@/types/auth';

// New types for registration functionality
export interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  access_code: string; // Now required for students
}

export interface ProfessorRegistrationRequest {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegistrationResponse {
  message: string;
  name: string;
  next_steps: string[];
}

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

  // Login and get tokens (forwards to DARE backend)
  async login(email: string, password: string): Promise<AuthTokens> {
    return baseRequest<AuthTokens>({
      url: 'users/login/',
      method: METHOD.POST,
      data: { email, password },
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

  // Fetch user profile (from SocraticBooks database)
  async fetchUserProfile(): Promise<User> {
    return baseRequest<User>({
      url: 'users/user-info/',
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

  // Register new user with access code
  async register(registrationData: RegistrationRequest): Promise<RegistrationResponse> {
    return baseRequest<RegistrationResponse>({
      url: 'access-codes/register/',
      method: METHOD.POST,
      data: registrationData,
      includeAuthToken: false,
    });
  }

  // Register new professor without access code
  async registerProfessor(
    registrationData: ProfessorRegistrationRequest
  ): Promise<RegistrationResponse> {
    return baseRequest<RegistrationResponse>({
      url: 'access-codes/register-professor/',
      method: METHOD.POST,
      data: registrationData,
      includeAuthToken: false,
    });
  }
}

export const authService = new AuthService();
