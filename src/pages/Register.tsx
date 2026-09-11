import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Mail, Mic } from 'lucide-react';
import * as Yup from 'yup';

import { useRegister } from '@/hooks/queries/useRegistration';

import { RegistrationUserType } from '@/services/auth.service';

import { rememberPostLoginRedirect, voiceSignupLandingPath } from '@/utils/postLoginRedirect';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registrationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirm_password: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  access_code: Yup.string().trim().required('Access code is required'),
});

const EXISTING_ACCOUNT_HINT = /already exists/i;

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  access_code: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [landingPath, setLandingPath] = useState<string | null>(null);

  const registerMutation = useRegister();
  const isExistingAccountError = !!generalError && EXISTING_ACCOUNT_HINT.test(generalError);

  const initialValues: FormValues = {
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    access_code: '',
  };

  const handleSubmit = async (values: FormValues) => {
    setGeneralError(null);

    try {
      const result = await registerMutation.mutateAsync(values);
      if (result.hasVoiceAccess) {
        const path = voiceSignupLandingPath(result.voiceAssignments);
        rememberPostLoginRedirect(path);
        setLandingPath(path);
      }
      setShowSuccess(true);
      setRegisteredEmail(values.email);
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setGeneralError(errorMessage);
    }
  };

  if (showSuccess) {
    const result = registerMutation.data;
    const isResearcher = result?.userType === RegistrationUserType.RESEARCHER;
    return (
      <div className="mx-auto mt-10 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 dark:text-green-400" />
            <CardTitle className="text-green-700 dark:text-green-400">
              Registration Successful!
            </CardTitle>
            <CardDescription>
              {isResearcher ? 'Your researcher account is ready' : 'Welcome to Socratic Bots'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result && (
              <div>
                <p className="text-muted-foreground text-center">{result.message}</p>
                {result.voiceAssignments.length > 0 && (
                  <ul className="mt-4 space-y-2" aria-label="Unlocked voice assignments">
                    {result.voiceAssignments.map(assignment => (
                      <li
                        key={assignment.id}
                        className="border-border bg-muted/40 flex items-center gap-3 rounded-md border p-3 text-sm"
                      >
                        <Mic className="text-primary h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-foreground font-medium">{assignment.name}</p>
                          {assignment.examTitle && (
                            <p className="text-muted-foreground text-xs">{assignment.examTitle}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {result.nextSteps && (
                  <div className="mt-4">
                    <h4 className="text-foreground font-medium">Next Steps:</h4>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      {result.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-muted-foreground mt-1.5 mr-2 h-1.5 w-1.5 rounded-full"></span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="border-primary/20 bg-primary/5 mt-2 rounded-md border p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Mail className="text-primary h-5 w-5" />
                </div>
                <div className="text-foreground text-sm">
                  {registeredEmail ? (
                    <>
                      We sent a verification link to{' '}
                      <span className="font-medium">{registeredEmail}</span>. Please verify your
                      email before logging in.
                    </>
                  ) : (
                    <>Please verify your email address before logging in.</>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() =>
                  navigate(
                    '/login',
                    landingPath ? { state: { from: { pathname: landingPath } } } : undefined
                  )
                }
                className="flex-1"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setGeneralError(null);
                  setLandingPath(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Register Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Join Socratic Bots with the access code from your instructor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={registrationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Field
                    as={Input}
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="name" component="p" className="text-destructive text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-3 right-3 h-4 w-4"
                      disabled={isSubmitting}
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

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="confirm_password"
                      name="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-3 right-3 h-4 w-4"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <ErrorMessage
                    name="confirm_password"
                    component="p"
                    className="text-destructive text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access_code">
                    Access Code
                    <span className="text-muted-foreground text-sm font-normal"> (Required)</span>
                  </Label>
                  <Field
                    as={Input}
                    id="access_code"
                    name="access_code"
                    type="text"
                    placeholder="Enter access code"
                    disabled={isSubmitting}
                  />

                  <div className="bg-primary/60 rounded-md p-3">
                    <p className="text-primary-foreground text-sm">
                      A <strong>course code</strong> enrolls you as a student in your instructor's
                      chat bots.
                    </p>
                    <p className="text-primary-foreground mt-1 text-sm">
                      A <strong>voice assignment code</strong> creates a researcher account: it
                      unlocks that assignment and lets you create your own voice agents.
                    </p>
                    <p className="text-primary-foreground mt-1 text-sm">
                      Already have an account? Sign in and enter the code there instead.
                    </p>
                  </div>

                  <ErrorMessage
                    name="access_code"
                    component="p"
                    className="text-destructive text-sm"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          {generalError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {generalError}
                {isExistingAccountError && (
                  <p className="mt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="font-medium underline"
                    >
                      Sign in
                    </button>{' '}
                    with that account and enter your access code under Voice Assignments or Access
                    Codes. Your existing role is kept.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-primary hover:underline">
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
