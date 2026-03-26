import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ForgotPasswordSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <Mail className="mx-auto h-16 w-16 text-blue-600 dark:text-blue-400" />
          <CardTitle>Check your email</CardTitle>
          <CardDescription>We've sent a password reset link to your email address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center text-sm">
            Please check your inbox and follow the instructions to reset your password. If you don't
            see the email, check your spam folder.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordSuccess;
