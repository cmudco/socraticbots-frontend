import { useMutation } from '@tanstack/react-query';

import {
  ProfessorRegistrationRequest,
  RegistrationRequest,
  RegistrationResponse,
  authService,
} from '@/services/auth.service';

export const registrationKeys = {
  all: ['registration'] as const,
};

/**
 * Hook to register a new student user with access code
 */
export const useRegister = () => {
  return useMutation<RegistrationResponse, Error, RegistrationRequest>({
    mutationFn: (registrationData: RegistrationRequest) => authService.register(registrationData),
    retry: false,
    onSuccess: () => {
    },
    onError: () => {
    },
  });
};

/**
 * Hook to register a new professor user without access code
 */
export const useRegisterProfessor = () => {
  return useMutation<RegistrationResponse, Error, ProfessorRegistrationRequest>({
    mutationFn: (registrationData: ProfessorRegistrationRequest) =>
      authService.registerProfessor(registrationData),
    retry: false,
    onSuccess: () => {
    },
    onError: () => {
    },
  });
};
