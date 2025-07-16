import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { authService } from '@/services/auth.service';

import type { AuthTokens } from '@/types/auth';

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
    staleTime: 30 * 1000,
    retry: false,
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
    staleTime: 5 * 60 * 1000,
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
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: async (tokens: AuthTokens) => {
      try {
        setAuth({
          user: null,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });

        const userData = await authService.fetchUserProfile();

        setAuth({
          user: userData,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });

        queryClient.setQueryData(authKeys.profile(tokens.access), userData);
      } catch (error) {
        console.error('Failed to fetch user profile after login:', error);
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
      return Promise.resolve();
    },
    onSuccess: () => {
      clearAuth();

      queryClient.clear();
    },
  });
};

/**
 * Hook for token refresh mutation - DISABLED
 * Refresh token functionality has been disabled to prevent backend errors
 */
export const useRefreshToken = () => {
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      console.log('Refresh token disabled - clearing authentication');
      throw new Error('Token refresh is disabled');
    },
    onError: () => {
      clearAuth();
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
    onSuccess: () => {},
    onError: error => {
      console.error('Password change failed:', error);
      throw error;
    },
  });
};
