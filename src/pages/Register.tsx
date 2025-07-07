import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import * as Yup from 'yup';

import { useRegister } from '@/hooks/queries/useRegistration';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Validation schema
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
  role: Yup.string().oneOf(['Student', 'Professor'], 'Invalid role').required('Role is required'),
  access_code: Yup.string().when('role', {
    is: 'Student',
    then: schema => schema.required('Access code is required for students'),
    otherwise: schema => schema.optional(),
  }),
});

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: string;
  access_code: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // React Query hooks
  const registerMutation = useRegister();

  const initialValues: FormValues = {
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: '',
    access_code: '',
  };

  const handleSubmit = async (values: FormValues) => {
    setGeneralError(null);

    try {
      await registerMutation.mutateAsync(values);
      setShowSuccess(true);
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setGeneralError(errorMessage);
    }
  };

  const handleRoleChange = (
    value: string,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    setFieldValue('role', value);
    // Clear access code if switching to Professor
    if (value === 'Professor') {
      setFieldValue('access_code', '');
    }
  };

  if (showSuccess) {
    return (
      <div className="mx-auto mt-10 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <CardTitle className="text-green-700">Registration Successful!</CardTitle>
            <CardDescription>Welcome to SocraticBooks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registerMutation.data && (
              <div>
                <p className="text-center text-gray-600">{registerMutation.data.message}</p>
                {registerMutation.data.next_steps && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700">Next Steps:</h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {registerMutation.data.next_steps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mt-1.5 mr-2 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="flex space-x-3">
              <Button onClick={() => navigate('/login')} className="flex-1">
                Go to Login
              </Button>
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setGeneralError(null);
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
          <CardDescription>Register for SocraticBooks as a student or professor</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={registrationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <Form className="space-y-4">
                {/* Name Field */}
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
                  <ErrorMessage name="name" component="p" className="text-sm text-red-600" />
                </div>

                {/* Email Field */}
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
                      disabled={isSubmitting}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-3 right-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="text-sm text-red-600" />
                </div>

                {/* Confirm Password Field */}
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
                      className="absolute top-3 right-3 h-4 w-4 text-gray-400 hover:text-gray-600"
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
                    className="text-sm text-red-600"
                  />
                </div>

                {/* Role Field */}
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select
                    value={values.role}
                    onValueChange={value => handleRoleChange(value, setFieldValue)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Professor">Professor</SelectItem>
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="role" component="p" className="text-sm text-red-600" />
                </div>

                {/* Access Code Field */}
                <div className="space-y-2">
                  <Label htmlFor="access_code">
                    Access Code
                    {values.role === 'Professor' && (
                      <span className="text-sm font-normal text-gray-500">
                        {' '}
                        (Optional for professors)
                      </span>
                    )}
                  </Label>
                  <Field
                    as={Input}
                    id="access_code"
                    name="access_code"
                    type="text"
                    placeholder={
                      values.role === 'Professor'
                        ? 'Enter access code (optional)'
                        : 'Enter your access code'
                    }
                    disabled={isSubmitting}
                  />

                  {/* Show helpful text for professors */}
                  {values.role === 'Professor' && !values.access_code && (
                    <div className="rounded-md bg-blue-50 p-3">
                      <p className="text-sm text-blue-700">
                        As a professor, you can register without an access code. You'll have full
                        access to create and manage content.
                      </p>
                    </div>
                  )}

                  <ErrorMessage name="access_code" component="p" className="text-sm text-red-600" />
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
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
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
