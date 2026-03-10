import { useMutation } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';

/**
 * Hook for forgot password mutation
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => authService.forgotPassword(email),
  });
};
