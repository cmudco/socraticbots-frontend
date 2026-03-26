import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';

import type { AuthTokens } from '@/types/auth';

/**
 * Hook for login mutation that works independently of the auth store
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: async (tokens: AuthTokens) => {
      try {
        // Store tokens in localStorage
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);

        // Invalidate user info to trigger refetch with new token
        queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      } catch (error) {
        console.error('Failed to handle login success:', error);
        throw error;
      }
    },
    onError: error => {
      console.error('Login failed:', error);
      // Clear any existing tokens on login failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  });
};