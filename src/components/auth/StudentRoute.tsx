import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

interface StudentRouteProps {
  children: React.ReactNode;
}

const StudentRoute: React.FC<StudentRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isProfessor) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default StudentRoute;
