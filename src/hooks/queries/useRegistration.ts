import { useMutation } from '@tanstack/react-query';

import {
  ProfessorRegistrationRequest,
  RegistrationRequest,
  RegistrationResponse,
  authService,
} from '@/services/auth.service';

// Query Keys
export const registrationKeys = {
  all: ['registration'] as const,
};

/**
 * Hook to register a new student user with access code
 */
export const useRegister = () => {
  return useMutation<RegistrationResponse, Error, RegistrationRequest>({
    mutationFn: (registrationData: RegistrationRequest) => authService.register(registrationData),
    retry: false, // Disable retries to prevent double requests
    onSuccess: data => {
      console.log('Student registration successful:', data);
    },
    onError: error => {
      console.error('Student registration failed:', error);
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
    retry: false, // Disable retries to prevent double requests
    onSuccess: data => {
      console.log('Professor registration successful:', data);
    },
    onError: error => {
      console.error('Professor registration failed:', error);
    },
  });
};
