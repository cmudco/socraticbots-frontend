import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import { AuthTokens, User } from '@/types/auth';

export interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  access_code: string;
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

  async login(email: string, password: string): Promise<AuthTokens> {
    return baseRequest<AuthTokens>({
      url: 'users/login/',
      method: METHOD.POST,
      data: { email, password },
      includeAuthToken: false,
    });
  }

  async refreshToken(): Promise<AuthTokens> {
    throw new Error('Token refresh is disabled');
  }

  async fetchUserProfile(): Promise<User> {
    return baseRequest<User>({
      url: 'users/user-info/',
      method: METHOD.GET,
    });
  }

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

  async register(registrationData: RegistrationRequest): Promise<RegistrationResponse> {
    return baseRequest<RegistrationResponse>({
      url: 'access-codes/register/',
      method: METHOD.POST,
      data: registrationData,
      includeAuthToken: false,
    });
  }

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
