// src/services/auth.service.ts
import { User, AuthTokens } from '../types/auth';
import { api } from './api/instance';

class AuthService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'https://api.socraticbooks.com/api';
  
  // Bootstrap methods (still using fetch)
  // Check if a token is valid
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/token/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
  
  // Login and get tokens (still using fetch for bootstrap)
  async login(username: string, password: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseUrl}/users/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    
    return data;
  }
  
  // Refresh tokens (still using fetch for bootstrap)
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    
    try {
      const response = await fetch(`${this.baseUrl}/users/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token refresh API error:', errorData);
        throw new Error(errorData.detail || errorData.code || 'Token refresh failed');
      }
      
      const data = await response.json();
      
      
      // Check if we got a new refresh token
      const newRefreshToken = data.refresh || refreshToken;
      
      // Log if refresh token changed
      if (data.refresh && data.refresh !== refreshToken) {
        //console.log('Refresh token was rotated');
      }
      
      return {
        access: data.access,
        refresh: newRefreshToken,
      };
    } catch (error) {
      console.error('Token refresh failed with exception:', error);
      throw error;
    }
  }
  
  // Methods using the configured API instance
  // Fetch user profile (using axios)
  async fetchUserProfile(accessToken: string): Promise<User | null> {
    try {
      // This is a direct call with a specific token, not using the interceptor
      const response = await api.get('/users/me/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
  
  // Additional auth methods would use the API instance
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      // This will use the configured API with auth token from interceptor
      await api.post('/users/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
