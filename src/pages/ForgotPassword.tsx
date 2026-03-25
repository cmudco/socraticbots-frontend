import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { AlertCircle, Loader2 } from 'lucide-react';
import * as Yup from 'yup';

import { useForgotPassword } from '@/hooks/useForgotPassword';

import { getErrorMessage } from '@/utils/errorHandler';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Email is required'),
});

interface FormValues {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPassword();

  const initialValues: FormValues = {
    email: '',
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await forgotPasswordMutation.mutateAsync({ email: values.email });
      navigate('/forgot-password-success');
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={forgotPasswordSchema}
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
                    disabled={isSubmitting || forgotPasswordMutation.isPending}
                  />
                  <ErrorMessage name="email" component="p" className="text-destructive text-sm" />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || forgotPasswordMutation.isPending}
                >
                  {isSubmitting || forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          {forgotPasswordMutation.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getErrorMessage(forgotPasswordMutation.error)}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-sm">
              Remember your password?{' '}
              <button onClick={() => navigate('/login')} className="text-primary hover:underline">
                Back to login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
