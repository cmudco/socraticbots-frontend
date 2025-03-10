// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthTokens, AuthState } from '../types/auth';
import { authService } from '../services/auth.service';

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
  
  // Track which tokens we've already tried to refresh
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState<{[key: string]: boolean}>({});

  // Check for existing tokens on load
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        
        if (storedTokens) {
          const tokens = JSON.parse(storedTokens) as AuthTokens;
          
          // Check if token is valid
          const isValid = await authService.validateToken(tokens.access);
          
          if (isValid) {
            // Fetch user data
            const userData = await authService.fetchUserProfile(tokens.access);
            
            setAuth({
              tokens,
              isAuthenticated: true,
              user: userData,
              isLoading: false,
            });
          } else {
            // Create a unique key for this refresh token to track attempts
            const refreshTokenKey = tokens.refresh.substring(0, 20);
            
            // Only attempt refresh if we haven't tried this token before
            if (!hasAttemptedRefresh[refreshTokenKey]) {
              console.log('First attempt to refresh this token');
              
              // Mark this token as attempted
              setHasAttemptedRefresh(prev => ({
                ...prev,
                [refreshTokenKey]: true
              }));
              
              // Try to refresh the token
              const refreshed = await refreshToken();
              if (!refreshed) {
                setAuth(prev => ({ ...prev, isLoading: false }));
              }
            } else {
              console.log('Skipping duplicate refresh attempt for token');
              setAuth(prev => ({ ...prev, isLoading: false }));
            }
          }
        } else {
          setAuth(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to load authentication state:', error);
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadStoredAuth();
  }, [hasAttemptedRefresh]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const tokens = await authService.login(username, password);
      
      // Store tokens
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      
      // Reset the refresh attempts tracking when logging in
      setHasAttemptedRefresh({});
      
      // Fetch user data
      const userData = await authService.fetchUserProfile(tokens.access);
      
      setAuth({
        user: userData,
        tokens,
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
    
    // Reset the refresh attempts tracking
    setHasAttemptedRefresh({});
    
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
      const storedTokens = localStorage.getItem('auth_tokens');
      if (!storedTokens) {
        console.log('No tokens in storage, cannot refresh');
        throw new Error('No refresh token available');
      }
      
      const tokens = JSON.parse(storedTokens) as AuthTokens;
      if (!tokens.refresh) {
        console.log('No refresh token in stored tokens');
        throw new Error('No refresh token available');
      }
      
      console.log('Using refresh token from storage:', tokens.refresh.substring(0, 10) + '...');
      
      // Get new tokens
      const newTokens = await authService.refreshToken(tokens.refresh);
      
      console.log('Got new tokens, updating storage immediately');
      
      // Update tokens in storage IMMEDIATELY
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      
      // Reset tracking for the new refresh token
      const newRefreshTokenKey = newTokens.refresh.substring(0, 20);
      setHasAttemptedRefresh(prev => ({
        ...prev,
        [newRefreshTokenKey]: false
      }));
      
      // Fetch user data
      const userData = await authService.fetchUserProfile(newTokens.access);
      
      setAuth({
        tokens: newTokens,
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return true;
    } catch (error) {
      console.error('Token refresh failed in AuthContext:', error);
      logout(); // Log out on refresh failure
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
