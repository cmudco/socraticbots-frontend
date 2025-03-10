// src/services/auth.service.ts
import { User, AuthTokens } from '../types/auth';

class AuthService {
  private readonly baseUrl = 'https://api.socraticbooks.com/api';
  
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
  
  // Fetch user profile
  async fetchUserProfile(accessToken: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
  
  // Login and get tokens
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
  
  // Refresh tokens
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    console.log('Attempting to refresh token with:', refreshToken.substring(0, 10) + '...');
    
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
      console.log('Token refresh successful, got new tokens');
      
      // Check if we got a new refresh token
      const newRefreshToken = data.refresh || refreshToken;
      
      // Log if refresh token changed
      if (data.refresh && data.refresh !== refreshToken) {
        console.log('Refresh token was rotated');
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
}

export const authService = new AuthService();
