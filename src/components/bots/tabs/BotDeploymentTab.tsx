import React, { useState } from 'react';

import { CheckCircle, Copy, RefreshCw } from 'lucide-react';

import { useIsProfessor } from '@/hooks/queries/useUser';

import { useBotFormStore } from '@/stores/forms/botFormStore';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BotDeploymentTabProps {
  botGroupId: number;
  botId: number;
}

const BotDeploymentTab: React.FC<BotDeploymentTabProps> = () => {
  const isProfessor = useIsProfessor();
  const {
    accessCode,
    accessCodeLimit,
    accessCodeUsed,
    updateAccessCode,
    updateAccessCodeLimit,
    updateAccessCodeUsed,
  } = useBotFormStore();
  const [copySuccess, setCopySuccess] = useState(false);
  const [customCode, setCustomCode] = useState('');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateAccessCode = (useCustomCode = false) => {
    const codeToUse = useCustomCode ? customCode.trim() : generateRandomCode();
    updateAccessCode(codeToUse);
    setCustomCode('');
  };

  const regenerateAccessCode = () => {
    const newCode = generateRandomCode();
    updateAccessCode(newCode);
  };

  const deleteAccessCode = () => {
    updateAccessCode('');
    updateAccessCodeLimit(0);
    updateAccessCodeUsed(0);
  };

  const handleCopyCode = async () => {
    if (!accessCode) return;

    try {
      await navigator.clipboard.writeText(accessCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy access code:', err);
    }
  };

  const handleAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAccessCode(e.target.value);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = val === '' ? 0 : Number(val);
    if (!Number.isNaN(num)) {
      updateAccessCodeLimit(num);
    }
  };

  // Only show deployment tab for professors
  if (!isProfessor) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        <p>Deployment features are only available for professors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{accessCode ? 'Bot Access Code' : 'Generate Access Code'}</CardTitle>
          <CardDescription>
            {accessCode
              ? 'Students can use this code to access this specific bot.'
              : 'Generate an access code for students to access this bot.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!accessCode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-code">Custom Access Code (Optional)</Label>
                <Input
                  id="custom-code"
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value)}
                  className="font-mono"
                  placeholder="Enter custom code or leave empty for random"
                />
                <p className="text-muted-foreground text-sm">
                  Leave empty to generate a random code, or enter a custom code that's memorable for
                  your students.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => generateAccessCode(false)} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Random Code
                </Button>

                {customCode.trim() && (
                  <Button onClick={() => generateAccessCode(true)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Use Custom Code
                  </Button>
                )}
              </div>
            </div>
          )}

          {accessCode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="access-code"
                    value={accessCode}
                    onChange={handleAccessCodeChange}
                    className="font-mono"
                    placeholder="Enter custom access code"
                  />
                  <Button size="sm" variant="outline" onClick={handleCopyCode} className="shrink-0">
                    {copySuccess ? (
                      <>
                        <CheckCircle className="mr-1 h-4 w-4 text-green-600 dark:text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">
                  You can customize this access code to make it memorable for your students. Click
                  "Update Bot" to save changes.
                </p>
              </div>

              <div className="space-y-1">
                <Label>Redemptions</Label>
                <div className="text-sm">
                  <span className="font-mono">
                    {accessCodeUsed || 0} / {accessCodeLimit}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Number of students who have redeemed this code.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-limit">Redemption Limit</Label>
                <Input
                  id="access-limit"
                  type="number"
                  min={0}
                  value={accessCodeLimit}
                  onChange={handleLimitChange}
                  placeholder="0"
                />
                <p className="text-muted-foreground text-sm">
                  Set how many students can redeem this code. 0 means no redemptions allowed.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={regenerateAccessCode}>
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Regenerate
                </Button>
                <Button size="sm" variant="destructive" onClick={deleteAccessCode}>
                  Delete Code
                </Button>
              </div>

              {copySuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Access code copied to clipboard! Share this with your students.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Students Access This Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>1. Students should log into the Socratic Books platform</p>
            <p>2. They can enter the access code to gain access to this bot</p>
            <p>3. Once redeemed, they can start chatting with the bot immediately</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotDeploymentTab;
