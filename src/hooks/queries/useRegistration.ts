import { useMutation } from '@tanstack/react-query';

import { RegistrationRequest, RegistrationResponse, authService } from '@/services/auth.service';

// Query Keys
export const registrationKeys = {
  all: ['registration'] as const,
};

/**
 * Hook to register a new user
 */
export const useRegister = () => {
  return useMutation<RegistrationResponse, Error, RegistrationRequest>({
    mutationFn: (registrationData: RegistrationRequest) => authService.register(registrationData),
    retry: false, // Disable retries to prevent double requests
    onSuccess: data => {
      console.log('Registration successful:', data);
    },
    onError: error => {
      console.error('Registration failed:', error);
    },
  });
};
