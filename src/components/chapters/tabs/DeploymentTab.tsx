// src/components/chapters/tabs/DeploymentTab.tsx
import React, { useState } from 'react';

import { AlertCircle, CheckCircle, Copy, Loader, Send } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

import { useChapterFormStore } from '@/stores/forms/chapterFormStore';

import { AccessCode, accessCodeService } from '@/services/accessCodes.service';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DeploymentTab: React.FC = () => {
  // Get user information for access control
  const { user } = useAuth();
  const { originalChapter } = useChapterFormStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<AccessCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const chapterId = originalChapter?.id;
  const existingAccessCode = originalChapter?.access_code;

  // Initialize the generated code from existing access code on mount
  React.useEffect(() => {
    if (existingAccessCode && !generatedCode) {
      setGeneratedCode(existingAccessCode);
    }
  }, [existingAccessCode, generatedCode]);

  const handleGenerateCode = async () => {
    if (!chapterId) {
      setError('Chapter ID is required to generate access code');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCode(null);

    try {
      const code = await accessCodeService.generateAccessCode(chapterId);
      setGeneratedCode(code);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate access code';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    const codeToUse = generatedCode || existingAccessCode;
    if (!codeToUse) return;

    try {
      await navigator.clipboard.writeText(codeToUse.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Only professors can generate access codes
  if (!user?.is_professor) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <h3 className="mb-2 text-lg font-medium">Chapter Deployment</h3>
          <p className="text-sm text-gray-600">
            Access code generation is only available for instructors.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              You don't have permission to generate access codes for this chapter.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="mb-2 text-lg font-medium">Chapter Deployment</h3>
        <p className="text-sm text-gray-600">
          Generate an access code to share this chapter with students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {existingAccessCode ? 'Chapter Access Code' : 'Generate Access Code'}
          </CardTitle>
          <CardDescription>
            {existingAccessCode
              ? 'This chapter already has an access code. You can regenerate it if needed.'
              : 'Create a unique access code that students can use to access this chapter.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGenerateCode}
            disabled={isGenerating || !chapterId}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                {existingAccessCode ? 'Regenerating...' : 'Generating...'}
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                {existingAccessCode ? 'Regenerate Access Code' : 'Generate Access Code'}
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle size={16} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(generatedCode || existingAccessCode) && (
            <div className="space-y-3">
              <Alert>
                <CheckCircle size={16} />
                <AlertDescription>
                  {existingAccessCode &&
                  (!generatedCode || generatedCode?.code === existingAccessCode.code)
                    ? 'Access code for this chapter. Share this code with your students.'
                    : 'Access code generated successfully! Share this code with your students.'}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="access-code"
                    value={(generatedCode || existingAccessCode)?.code || ''}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={handleCopyCode} variant="outline" size="sm">
                    {copySuccess ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Target:</strong>{' '}
                  {(generatedCode || existingAccessCode)?.target_name || ''}
                </p>
                <p>
                  <strong>Type:</strong> {(generatedCode || existingAccessCode)?.target_type || ''}
                </p>
                <p>
                  <strong>Created:</strong>{' '}
                  {(generatedCode || existingAccessCode)?.created_at
                    ? new Date((generatedCode || existingAccessCode)!.created_at).toLocaleString()
                    : ''}
                </p>
              </div>
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
            <p>Share the access code with your students to give them access to this chapter:</p>
            <ol className="ml-4 list-inside list-decimal space-y-1">
              <li>Go to the SocraticBooks registration page</li>
              <li>Enter their personal details (name, email, password)</li>
              <li>Enter the access code you generated in the "Access Code" field</li>
              <li>Complete registration - they'll be automatically enrolled as students</li>
              <li>They can then access and interact with this chapter content</li>
            </ol>
            <p className="mt-3 text-xs text-gray-500">
              <strong>Note:</strong> Each chapter has one unique access code that remains the same.
              Students who register with an access code will only have access to the specific
              chapter associated with that code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentTab;
