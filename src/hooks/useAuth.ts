// src/hooks/useAuth.ts
import { useAuthStore } from '@/stores/authStore';

import { useLogin, useLogout } from './queries/useAuth';

/**
 * Main auth hook that provides auth state and actions
 * This replaces the useAuth hook from AuthContext
 */
export const useAuth = () => {
  const authState = useAuthStore();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    // Auth state
    ...authState,

    // Actions
    login,
    logout,

    // Mutation states for UI feedback
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  };
};
