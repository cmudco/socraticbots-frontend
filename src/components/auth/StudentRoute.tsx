// src/components/auth/StudentRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

interface StudentRouteProps {
  children: React.ReactNode;
}

const StudentRoute: React.FC<StudentRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is a professor, redirect to home
  if (user?.is_professor) {
    return <Navigate to="/" replace />;
  }

  // If user is a student, render the children
  return <>{children}</>;
};

export default StudentRoute;
