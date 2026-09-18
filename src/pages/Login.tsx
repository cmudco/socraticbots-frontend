import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import * as Yup from 'yup';

import { useIsAuthenticated } from '@/hooks/queries/useUser';
import { useLogin } from '@/hooks/useLogin';

import { getErrorMessage } from '@/utils/errorHandler';
import { consumePostLoginRedirect } from '@/utils/postLoginRedirect';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const isAuthenticated = useIsAuthenticated();
  const loginMutation = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const locationState = location.state as LocationState;
  const redirectPath = locationState?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const initialValues: FormValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await loginMutation.mutateAsync({ email: values.email, password: values.password });
      // A voice-code sign-up remembers its assignment across the email-verification
      // round trip; an explicit "from" location still wins.
      const rememberedPath = consumePostLoginRedirect();
      navigate(locationState?.from?.pathname || rememberedPath || redirectPath, {
        replace: true,
      });
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your Socratic Bots account</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    disabled={isSubmitting || loginMutation.isPending}
                  />
                  <ErrorMessage name="email" component="p" className="text-destructive text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      disabled={isSubmitting || loginMutation.isPending}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-3 right-3 h-4 w-4"
                      disabled={isSubmitting || loginMutation.isPending}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-destructive text-sm"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-primary text-sm hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || loginMutation.isPending}
                >
                  {(isSubmitting || loginMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <span>
                    {isSubmitting || loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                  </span>
                </Button>
              </Form>
            )}
          </Formik>

          {loginMutation.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getErrorMessage(loginMutation.error)}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:underline"
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
