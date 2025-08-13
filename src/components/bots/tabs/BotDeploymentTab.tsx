import React, { useState, useEffect } from 'react';

import { CheckCircle, Copy, RefreshCw } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

import { useBotFormStore } from '@/stores/forms/botFormStore';
import { botService } from '@/services/bots.service';
import { BotAccessCode } from '@/types/bot';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BotDeploymentTabProps {
  botGroupId: number;
  botId: number;
}

const BotDeploymentTab: React.FC<BotDeploymentTabProps> = ({ botGroupId, botId }) => {
  const { user } = useAuth();
  const { accessCode, updateAccessCode } = useBotFormStore();
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botAccessCode, setBotAccessCode] = useState<BotAccessCode | null>(null);
  const [customCode, setCustomCode] = useState('');

  // Load existing access code when component mounts
  useEffect(() => {
    loadAccessCode();
  }, [botGroupId, botId]);

  const loadAccessCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const existingCode = await botService.getBotAccessCode(botGroupId, botId);
      setBotAccessCode(existingCode);
      if (existingCode) {
        updateAccessCode(existingCode.code);
      }
    } catch (err) {
      console.error('Error loading access code:', err);
      setError('Failed to load access code');
    } finally {
      setLoading(false);
    }
  };

  const generateAccessCode = async (useCustomCode = false) => {
    try {
      setLoading(true);
      setError(null);
      const codeToUse = useCustomCode ? customCode.trim() : undefined;
      const newCode = await botService.generateBotAccessCode(botGroupId, botId, codeToUse);
      setBotAccessCode(newCode);
      updateAccessCode(newCode.code);
      setCustomCode(''); // Clear custom code input after successful generation
    } catch (err) {
      console.error('Error generating access code:', err);
      setError('Failed to generate access code. The code might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const regenerateAccessCode = async () => {
    await generateAccessCode(false); // Generate random code
  };

  const deleteAccessCode = async () => {
    try {
      setLoading(true);
      setError(null);
      await botService.deleteBotAccessCode(botGroupId, botId);
      setBotAccessCode(null);
      updateAccessCode('');
    } catch (err) {
      console.error('Error deleting access code:', err);
      setError('Failed to delete access code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    const codeToUse = accessCode || botAccessCode?.code;
    if (!codeToUse) return;

    try {
      await navigator.clipboard.writeText(codeToUse);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy access code:', err);
    }
  };

  const handleAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAccessCode(e.target.value);
  };

  // Only show deployment tab for professors
  if (!user?.isProfessor) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Deployment features are only available for professors.</p>
      </div>
    );
  }

  const currentAccessCode = accessCode || botAccessCode?.code;

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{botAccessCode ? 'Bot Access Code' : 'Generate Access Code'}</CardTitle>
          <CardDescription>
            {botAccessCode
              ? 'Students can use this code to access this specific bot.'
              : 'Generate an access code for students to access this bot.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!botAccessCode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-code">Custom Access Code (Optional)</Label>
                <Input
                  id="custom-code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="font-mono"
                  placeholder="Enter custom code or leave empty for random"
                />
                <p className="text-sm text-gray-500">
                  Leave empty to generate a random code, or enter a custom code that's memorable for your students.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => generateAccessCode(false)}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Generate Random Code
                </Button>
                
                {customCode.trim() && (
                  <Button
                    onClick={() => generateAccessCode(true)}
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Use Custom Code
                  </Button>
                )}
              </div>
            </div>
          )}

          {botAccessCode && (
            <Button
              onClick={() => generateAccessCode(false)}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Generate New Access Code
            </Button>
          )}

          {currentAccessCode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="access-code"
                    value={currentAccessCode}
                    onChange={handleAccessCodeChange}
                    className="font-mono"
                    placeholder="Enter custom access code"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="shrink-0"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
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
                <p className="text-sm text-gray-500">
                  You can customize this access code to make it memorable for your students.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => regenerateAccessCode()}
                  disabled={loading}
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={deleteAccessCode}
                  disabled={loading}
                >
                  Delete Code
                </Button>
              </div>

              {botAccessCode && (
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p>
                    <strong>Created by:</strong> {botAccessCode.created_by}
                  </p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {botAccessCode.created_at
                      ? new Date(botAccessCode.created_at).toLocaleString()
                      : 'Unknown'}
                  </p>
                </div>
              )}

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
          <div className="space-y-2 text-sm text-gray-600">
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
