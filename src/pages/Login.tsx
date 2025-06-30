// src/pages/Login.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

import { useFormStore } from '@/stores/forms/formStore';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, isLoginPending, loginError } = useAuth();

  // Use Zustand for form state management
  const { loginForm, setLoginFormField, setLoginFormError, clearLoginFormErrors, resetLoginForm } =
    useFormStore();

  // Get the previous location with a fallback to home page
  const locationState = location.state as LocationState;
  const redirectPath = locationState?.from?.pathname || '/';

  // Clear form when component mounts
  useEffect(() => {
    resetLoginForm();
  }, [resetLoginForm]);

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    console.log('User is authenticated, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearLoginFormErrors();

    try {
      const success = await login(loginForm.username, loginForm.password);

      if (success) {
        // Clear form on successful login
        resetLoginForm();
        // Redirect to the page they were trying to visit, or home
        navigate(redirectPath, { replace: true });
      } else {
        setLoginFormError('general', loginError?.message || 'Login failed');
      }
    } catch (err) {
      setLoginFormError(
        'general',
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
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

      {(loginForm.errors.general || loginError) && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {loginForm.errors.general || loginError?.message}
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
            value={loginForm.username}
            onChange={e => setLoginFormField('username', e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
            disabled={isLoginPending}
          />
          {loginForm.errors.username && (
            <p className="mt-1 text-sm text-red-600">{loginForm.errors.username}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={loginForm.password}
            onChange={e => setLoginFormField('password', e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
            disabled={isLoginPending}
          />
          {loginForm.errors.password && (
            <p className="mt-1 text-sm text-red-600">{loginForm.errors.password}</p>
          )}
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
