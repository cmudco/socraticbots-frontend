// src/hooks/queries/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { authService } from '@/services/auth.service';

import type { AuthTokens } from '@/types/auth';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: (token: string) => [...authKeys.all, 'profile', token] as const,
} as const;

/**
 * Hook to validate an auth token
 */
export const useValidateToken = (token?: string) => {
  return useQuery({
    queryKey: [...authKeys.all, 'validate', token],
    queryFn: () => authService.validateToken(token!),
    enabled: !!token,
    staleTime: 30 * 1000, // 30 seconds
    retry: false, // Don't retry failed token validation
  });
};

/**
 * Hook to fetch user profile
 */
export const useUserProfile = (token?: string) => {
  return useQuery({
    queryKey: authKeys.profile(token || ''),
    queryFn: () => authService.fetchUserProfile(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook for login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authService.login(username, password),
    onSuccess: async (tokens: AuthTokens) => {
      try {
        // First, store the tokens in the auth store (this will also store in localStorage)
        setAuth({
          user: null, // We'll update this after fetching the profile
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });

        // Now fetch user profile (tokens are now available)
        const userData = await authService.fetchUserProfile();

        // Update the user in the store
        setAuth({
          user: userData,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });

        // Cache user profile in React Query
        queryClient.setQueryData(authKeys.profile(tokens.access), userData);
      } catch (error) {
        console.error('Failed to fetch user profile after login:', error);
        // Clear auth on profile fetch failure
        clearAuth();
        throw error;
      }
    },
    onError: error => {
      console.error('Login failed:', error);
      clearAuth();
    },
  });
};

/**
 * Hook for logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      // No server-side logout needed for JWT
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear Zustand store (this will also clear localStorage)
      clearAuth();

      // Clear all queries from cache
      queryClient.clear();
    },
  });
};

/**
 * Hook for token refresh mutation
 */
export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: (refreshToken: string) => authService.refreshToken(refreshToken),
    onSuccess: async (newTokens: AuthTokens) => {
      try {
        // Fetch updated user profile
        const userData = await authService.fetchUserProfile();

        // Update Zustand store (this will also store tokens in localStorage)
        setAuth({
          user: userData,
          tokens: newTokens,
          isAuthenticated: true,
          isLoading: false,
        });

        // Update cached user profile
        queryClient.setQueryData(authKeys.profile(newTokens.access), userData);
      } catch (error) {
        console.error('Failed to fetch user profile after token refresh:', error);
        throw error;
      }
    },
    onError: error => {
      console.error('Token refresh failed:', error);
      // Clear auth on refresh failure
      clearAuth();
      // Clear all queries on auth failure
      queryClient.clear();
    },
  });
};

/**
 * Hook for change password mutation
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      authService.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      // Password changed successfully
    },
    onError: error => {
      console.error('Password change failed:', error);
      throw error;
    },
  });
};
