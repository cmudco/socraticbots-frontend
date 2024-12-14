// src/pages/Dashboard.tsx
import { useAuth } from '../contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      {user && <p>Logged in as: {user.email}</p>}
    </div>
  );
};