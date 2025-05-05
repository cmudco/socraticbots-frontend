// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowHondaUsers?: boolean;
}


const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowHondaUsers = false // By default, Honda users can't access routes
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if Honda user trying to access restricted route
  const isHondaUser = user?.username?.toLowerCase().startsWith('honda');
  
  // If Honda user and route is not allowed for Honda users, redirect to chat
  if (isHondaUser && !allowHondaUsers) {
    return <Navigate to="/chat" replace />;
  }
  
  // Otherwise, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
