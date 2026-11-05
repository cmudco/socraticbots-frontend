import { useMutation } from '@tanstack/react-query';

import { RegistrationRequest, RegistrationResponse, authService } from '@/services/auth.service';

export const registrationKeys = {
  all: ['registration'] as const,
};

/**
 * Hook to register a new student user with subscription code
 */
export const useRegister = () => {
  return useMutation<RegistrationResponse, Error, RegistrationRequest>({
    mutationFn: (registrationData: RegistrationRequest) => authService.register(registrationData),
    retry: false,
    onSuccess: () => {},
    onError: () => {},
  });
};
