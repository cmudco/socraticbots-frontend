// src/pages/Login.tsx
import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, isLoginPending, loginError } = useAuth();

  // Get the previous location with a fallback to home page
  const locationState = location.state as LocationState;
  const redirectPath = locationState?.from?.pathname || '/';

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    console.log('User is authenticated, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(username, password);

      if (success) {
        // Redirect to the page they were trying to visit, or home
        navigate(redirectPath, { replace: true });
      } else {
        setError(loginError?.message || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Show loading state while initial auth check is in progress
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">Checking authentication...</div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2 block text-gray-700" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
            disabled={isLoginPending}
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
            disabled={isLoginPending}
          />
        </div>

        <button
          type="submit"
          disabled={isLoginPending}
          className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoginPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
