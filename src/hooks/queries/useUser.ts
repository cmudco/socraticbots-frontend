import { useQuery } from '@tanstack/react-query';

import { User, userService } from '@/services/user.service';

export const useUserInfo = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: () => userService.getUserInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes - user data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    retry: () => {
      return false;
    },
    // Without this, an unauthenticated visitor on the landing page loops forever:
    // the errored query refetches whenever a component mounts an observer,
    // flipping ProtectedRoute between loading and error states
    retryOnMount: false,
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

// Convenience hook for creator checks
export const useIsCreator = (): boolean => {
  const user = useUser();
  return user?.isCreator ?? false;
};

// Logout hook
export const useLogout = () => {
  return () => userService.logout();
};
