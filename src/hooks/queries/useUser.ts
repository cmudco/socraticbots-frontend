import { useQuery } from '@tanstack/react-query';
import { userService, User } from '@/services/user.service';

export const useUserInfo = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: () => userService.getUserInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes - user data doesn't change often
    gcTime: 30 * 60 * 1000,   // 30 minutes - keep in cache longer
    retry: () => {
      return false;
    },
    refetchOnWindowFocus: true, // Refresh when user comes back
  });
};

// Convenience hook for just getting user data without loading states
export const useUser = (): User | undefined => {
  const { data } = useUserInfo();
  return data;
};

// Convenience hook for auth checks
export const useIsAuthenticated = (): boolean => {
  const { data, isSuccess } = useUserInfo();
  return isSuccess && !!data;
};

// Convenience hook for professor checks
export const useIsProfessor = (): boolean => {
  const user = useUser();
  return user?.isProfessor ?? false;
};

// Logout hook
export const useLogout = () => {
  return () => userService.logout();
};