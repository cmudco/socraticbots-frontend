// src/pages/Login.tsx
import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import * as Yup from 'yup';

import { useAuth } from '@/hooks/useAuth';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Validation schema
const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

interface FormValues {
  email: string;
  password: string;
}

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, isLoginPending } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Get the previous location with a fallback to home page
  const locationState = location.state as LocationState;
  const redirectPath = locationState?.from?.pathname || '/';

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to={redirectPath} replace />;
  }

  const initialValues: FormValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values: FormValues) => {
    setGeneralError(null);

    try {
      const success = await login(values.email, values.password);

      if (success) {
        // Redirect to the page they were trying to visit, or home
        navigate(redirectPath, { replace: true });
      } else {
        setGeneralError('Login failed. Please check your credentials.');
      }
    } catch (error: unknown) {
      console.error('Login failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed. Please try again.';
      setGeneralError(errorMessage);
    }
  };

  // Show loading state while initial auth check is in progress
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your SocraticBooks account</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    disabled={isSubmitting || isLoginPending}
                  />
                  <ErrorMessage name="email" component="p" className="text-sm text-red-600" />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      disabled={isSubmitting || isLoginPending}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-3 right-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      disabled={isSubmitting || isLoginPending}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="text-sm text-red-600" />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || isLoginPending}>
                  {isSubmitting || isLoginPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          {generalError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:underline"
              >
                Create account
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
