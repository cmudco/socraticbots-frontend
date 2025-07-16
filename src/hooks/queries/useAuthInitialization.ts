import { useEffect, useRef } from 'react';

import { METHOD } from '@/constants/requests';

import { useAuthStore } from '@/stores/authStore';

import { baseRequest } from '@/utils/baseRequest';

import type { User } from '@/types/auth';

/**
 * Hook to initialize authentication state on app startup
 * This replaces the AuthContext initialization logic
 */
export const useAuthInitialization = () => {
  const { setAuth, clearAuth, setLoading, initializeAuth } = useAuthStore();
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;

    const initializeAuthState = async () => {
      try {
        setLoading(true);

        initializeAuth();

        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken || !refreshToken) {
          clearAuth();
          return;
        }

        const isValid = await validateToken(accessToken);

        if (isValid) {
          try {
            const userData = await fetchUserProfile();

            setAuth({
              tokens: { access: accessToken, refresh: refreshToken },
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            clearAuth();
          }
        } else {
          console.log('Access token is invalid, clearing authentication');
          clearAuth();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuth();
      }
    };

    initializeAuthState();
  }, []);
};

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

const fetchUserProfile = async (): Promise<User> => {
  return baseRequest<User>({
    url: 'users/user-info/',
    method: METHOD.GET,
  });
};
