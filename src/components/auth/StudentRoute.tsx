import React from 'react';
import { Navigate } from 'react-router-dom';

import { useUser } from '@/hooks/queries/useUser';

interface StudentRouteProps {
  children: React.ReactNode;
}

const StudentRoute: React.FC<StudentRouteProps> = ({ children }) => {
  const user = useUser();

  // If no user (not authenticated), redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If professor, redirect to home (students only route)
  if (user.isProfessor) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default StudentRoute;
