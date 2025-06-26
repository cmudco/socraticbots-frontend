// src/hooks/queries/useAuthInitialization.ts
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';
import type { AuthTokens } from '../../types/auth';

/**
 * Hook to initialize authentication state on app startup
 * This replaces the AuthContext initialization logic
 */
export const useAuthInitialization = () => {
  const { setAuth, clearAuth, setLoading } = useAuthStore();
  const initializationRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        console.log('Auth initialization starting...');

        const storedTokens = localStorage.getItem('auth_tokens');

        if (!storedTokens) {
          // No tokens stored, user is not authenticated
          console.log('No stored tokens found');
          clearAuth();
          return;
        }

        const tokens: AuthTokens = JSON.parse(storedTokens);
        console.log('Found stored tokens, validating...');

        // First, validate the access token
        const isValid = await validateTokenSync(tokens.access);

        if (isValid) {
          // Token is valid, fetch user profile
          try {
            console.log('Token is valid, fetching user profile...');
            const userData = await fetchUserProfileSync(tokens.access);

            setAuth({
              tokens,
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
          if (tokens.refresh) {
            try {
              console.log('Access token invalid, attempting refresh');
              const newTokens = await authService.refreshToken(tokens.refresh);

              // Save new tokens
              localStorage.setItem('auth_tokens', JSON.stringify(newTokens));

              // Fetch user profile with new token
              const userData = await fetchUserProfileSync(newTokens.access);

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
          } else {
            console.log('No refresh token available');
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuth();
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once - Zustand store methods are stable
};

// Helper function to validate token synchronously
const validateTokenSync = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/users/token/verify/`, {
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
};

// Helper function to fetch user profile synchronously
const fetchUserProfileSync = async (accessToken: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/users/me/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};
