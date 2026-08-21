import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import Landing from '@/pages/Landing';

import { useUserInfo } from '@/hooks/queries/useUser';
import { useSocketConnection } from '@/hooks/useSocketConnection';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: user, isLoading, isError } = useUserInfo();
  const location = useLocation();

  // Initialize Socket.IO connection when user is authenticated
  // This ensures socket connects on login and stays connected across protected routes
  useSocketConnection();

  // Show loading spinner while fetching user data
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If no user data or error (likely 401), show the public landing page at the
  // root URL; any other protected route redirects to login
  if (isError || !user) {
    if (location.pathname === '/') {
      return <Landing />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
