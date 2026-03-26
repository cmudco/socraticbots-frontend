import React, { useState } from 'react';

import { CheckCircle, Copy, ExternalLink, Globe, RefreshCw } from 'lucide-react';

import { useIsCreator } from '@/hooks/queries/useUser';

import { useBotFormStore } from '@/stores/forms/botFormStore';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BotDeploymentTabProps {
  botGroupId: number;
  botId: number;
}

const BotDeploymentTab: React.FC<BotDeploymentTabProps> = ({ botId }) => {
  const isCreator = useIsCreator();
  const {
    accessCode,
    accessCodeLimit,
    accessCodeUsed,
    updateAccessCode,
    updateAccessCodeLimit,
    updateAccessCodeUsed,
    isPubliclyDeployed,
    budget,
    budgetUsed,
    setIsPubliclyDeployed,
    updateBudget,
  } = useBotFormStore();
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyUrlSuccess, setCopyUrlSuccess] = useState(false);
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
      console.error('Failed to copy subscription code:', err);
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

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBudget(e.target.value);
  };

  const handleBudgetBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);

    if (value === '' || isNaN(numValue) || numValue < 1) {
      updateBudget('1');
    } else if (numValue > 20) {
      updateBudget('20');
    }
  };

  const getPublicBotUrl = () => {
    return `${window.location.origin}/public-deployment/bot/${botId}`;
  };

  const handleCopyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(getPublicBotUrl());
      setCopyUrlSuccess(true);
      setTimeout(() => setCopyUrlSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy public URL:', err);
    }
  };

  // Only show deployment tab for creators
  if (!isCreator) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        <p>Deployment features are only available for creators.</p>
      </div>
    );
  }

  const budgetUsedNum = Number(budgetUsed) || 0;
  const budgetRemaining = budget ? parseFloat(budget) - budgetUsedNum : 0;
  const budgetPercent =
    budget && parseFloat(budget) > 0 ? (budgetUsedNum / parseFloat(budget)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Public Deployment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Public Deployment
          </CardTitle>
          <CardDescription>
            Make this bot publicly accessible without requiring user authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-deploy">Public Access</Label>
              <p className="text-muted-foreground text-sm">
                Allow anyone with the link to chat with this bot
              </p>
            </div>
            <Switch
              id="public-deploy"
              checked={isPubliclyDeployed}
              onCheckedChange={setIsPubliclyDeployed}
            />
          </div>

          {isPubliclyDeployed && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="1"
                  max="20"
                  step="0.01"
                  value={budget || ''}
                  onChange={handleBudgetChange}
                  onBlur={handleBudgetBlur}
                  placeholder="1.00"
                  required
                />
                <p className="text-muted-foreground text-sm">
                  Set a budget limit for public usage (minimum $1, maximum $20).
                </p>
              </div>

              {budget && parseFloat(budget) > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget Used</span>
                    <span className="font-mono">
                      ${budgetUsedNum.toFixed(2)} / ${parseFloat(budget).toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-secondary h-2 overflow-hidden rounded-full">
                    <div
                      className={`h-full transition-all ${
                        budgetPercent >= 90
                          ? 'bg-destructive'
                          : budgetPercent >= 70
                            ? 'bg-yellow-500'
                            : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    ${budgetRemaining.toFixed(2)} remaining
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Public URL</Label>
                <div className="flex gap-2">
                  <Input value={getPublicBotUrl()} readOnly className="font-mono text-sm" />
                  <Button size="sm" variant="outline" onClick={handleCopyPublicUrl}>
                    {copyUrlSuccess ? (
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(getPublicBotUrl(), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">
                  Share this URL to allow anonymous access to this bot. Users won't need to log in.
                </p>
              </div>

              {copyUrlSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Public URL copied to clipboard! Anyone with this link can access the bot.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {accessCode ? 'Bot Subscription Code' : 'Generate Subscription Code'}
          </CardTitle>
          <CardDescription>
            {accessCode
              ? 'Students can use this code to access this specific bot.'
              : 'Generate a subscription code for students to access this bot.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!accessCode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-code">Custom Subscription Code (Optional)</Label>
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
                <Label htmlFor="access-code">Subscription Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="access-code"
                    value={accessCode}
                    onChange={handleAccessCodeChange}
                    className="font-mono"
                    placeholder="Enter custom subscription code"
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
                  You can customize this subscription code to make it memorable for your students.
                  Click "Update Bot" to save changes.
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
                    Subscription code copied to clipboard! Share this with your students.
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
            <p>2. They can enter the subscription code to gain access to this bot</p>
            <p>3. Once redeemed, they can start chatting with the bot immediately</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotDeploymentTab;
