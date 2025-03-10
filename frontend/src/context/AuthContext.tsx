// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthTokens, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing tokens on load
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        
        if (storedTokens) {
          const tokens = JSON.parse(storedTokens) as AuthTokens;
          
          // TODO: Fetch user info with the token
          // For now, we'll just set isAuthenticated to true
          setAuth({
            tokens,
            isAuthenticated: true,
            user: null, // We'll fetch user data in the next step
            isLoading: false,
          });
        } else {
          setAuth(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to load authentication state:', error);
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.socraticbooks.com/api/users/token/', {
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
      
      // Store tokens
      localStorage.setItem('auth_tokens', JSON.stringify(data));
      
      // TODO: Fetch user data
      // For now we'll just set a basic user object
      const user: User = {
        id: 1, // This is placeholder, we should fetch the real user ID
        username: username,
        email: '', // This should come from a user profile API call
      };
      
      setAuth({
        user,
        tokens: data,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    // Remove tokens from storage
    localStorage.removeItem('auth_tokens');
    
    // Reset auth state
    setAuth({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!auth.tokens?.refresh) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch('https://api.socraticbooks.com/api/users/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: auth.tokens.refresh }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Token refresh failed');
      }
      
      // Update tokens in storage - keep the same refresh token unless the API sends a new one
      const newTokens = {
        access: data.access,
        refresh: data.refresh || auth.tokens.refresh,
      };
      
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      
      setAuth(prev => ({
        ...prev,
        tokens: newTokens,
      }));
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, log the user out
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
