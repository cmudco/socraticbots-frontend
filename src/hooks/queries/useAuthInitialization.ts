// src/hooks/queries/useAuthInitialization.ts
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';
import { baseRequest } from '../../utils/baseRequest';
import type { User } from '../../types/auth';
import { METHOD } from '@/constants/requests';

/**
 * Hook to initialize authentication state on app startup
 * This replaces the AuthContext initialization logic
 */
export const useAuthInitialization = () => {
  const { setAuth, clearAuth, setLoading, initializeAuth } = useAuthStore();
  const initializationRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;

    const initializeAuthState = async () => {
      try {
        setLoading(true);
        console.log('Auth initialization starting...');

        // Initialize from localStorage first
        initializeAuth();

        // Check if we have tokens
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken || !refreshToken) {
          // No tokens stored, user is not authenticated
          console.log('No stored tokens found');
          clearAuth();
          return;
        }

        console.log('Found stored tokens, validating...');

        // Validate the access token
        const isValid = await validateToken(accessToken);

        if (isValid) {
          // Token is valid, fetch user profile
          try {
            console.log('Token is valid, fetching user profile...');
            const userData = await fetchUserProfile();

            setAuth({
              tokens: { access: accessToken, refresh: refreshToken },
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log('Auth initialization completed successfully');
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            clearAuth();
          }
        } else {
          // Access token is invalid, try to refresh
          try {
            console.log('Access token invalid, attempting refresh');
            const newTokens = await authService.refreshToken(refreshToken);

            // Fetch user profile with new token
            const userData = await fetchUserProfile();

            setAuth({
              tokens: newTokens,
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log('Token refresh and auth initialization completed successfully');
          } catch (error) {
            console.error('Token refresh failed during initialization:', error);
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuth();
      }
    };

    initializeAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once - Zustand store methods are stable
};

// Helper function to validate token
const validateToken = async (token: string): Promise<boolean> => {
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
};

// Helper function to fetch user profile
const fetchUserProfile = async (): Promise<User> => {
  return baseRequest<User>({
    url: 'users/me/',
    method: METHOD.GET,
  });
};
