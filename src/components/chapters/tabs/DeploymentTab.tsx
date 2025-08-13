import React, { useState } from 'react';

import { CheckCircle, Copy, RefreshCw } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

import { useChapterFormStore } from '@/stores/forms/chapterFormStore';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DeploymentTab: React.FC = () => {
  const { user } = useAuth();
  const { originalChapter, accessCode, updateAccessCode } = useChapterFormStore();
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);

  const existingAccessCode = originalChapter?.access_code;

  const generateAccessCode = () => {
    const generateUniqueCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'SB-';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const newCode = generateUniqueCode();
    updateAccessCode(newCode);
    setHasGeneratedCode(true);
  };

  const handleCopyCode = async () => {
    const codeToUse = accessCode || existingAccessCode?.code;
    if (!codeToUse) return;

    try {
      await navigator.clipboard.writeText(codeToUse);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAccessCode(e.target.value);
  };

  if (!user?.isProfessor) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <h3 className="mb-2 text-lg font-medium">Bot Deployment</h3>
          <p className="text-sm text-gray-600">
            Access code generation is only available for instructors.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              You don't have permission to generate access codes for this bot.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAccessCode = accessCode || existingAccessCode?.code;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="mb-2 text-lg font-medium">Bot Deployment</h3>
        <p className="text-sm text-gray-600">
          Generate an access code to share this bot with students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{existingAccessCode ? 'Bot Access Code' : 'Generate Access Code'}</CardTitle>
          <CardDescription>
            {existingAccessCode
              ? 'This bot already has an access code. You can modify it or generate a new one.'
              : 'Create a unique access code that students can use to access this bot.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateAccessCode} className="w-full" variant="outline">
            <RefreshCw size={16} className="mr-2" />
            {existingAccessCode ? 'Generate New Access Code' : 'Generate Access Code'}
          </Button>

          {(currentAccessCode || hasGeneratedCode || existingAccessCode) && (
            <div className="space-y-3">
              <Alert>
                <CheckCircle size={16} />
                <AlertDescription>
                  {existingAccessCode && !accessCode
                    ? 'Current access code for this bot. You can modify it below.'
                    : 'Access code generated! You can customize it below and save when updating the bot.'}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="access-code"
                    value={currentAccessCode || ''}
                    onChange={handleAccessCodeChange}
                    placeholder="Enter custom access code"
                    className="font-mono"
                  />
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="sm"
                    disabled={!currentAccessCode}
                  >
                    {copySuccess ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  You can customize this access code to make it memorable for your students.
                </p>
              </div>

              {existingAccessCode && (
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Target:</strong> {existingAccessCode.target_name || ''}
                  </p>
                  <p>
                    <strong>Type:</strong> {existingAccessCode.target_type || ''}
                  </p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {existingAccessCode.created_at
                      ? new Date(existingAccessCode.created_at).toLocaleString()
                      : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions for Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Share the access code with your students to give them access to this bot:</p>
            <ol className="ml-4 list-inside list-decimal space-y-1">
              <li>Go to the Socratic Bots registration page</li>
              <li>Enter their personal details (name, email, password)</li>
              <li>Enter the access code you generated in the "Access Code" field</li>
              <li>Complete registration - they'll be automatically enrolled as students</li>
              <li>They can then access and interact with this bot content</li>
            </ol>
            <p className="mt-3 text-xs text-gray-500">
              <strong>Note:</strong> Each bot has one unique access code that remains the same.
              Students who register with an access code will only have access to the specific bot
              associated with that code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentTab;
