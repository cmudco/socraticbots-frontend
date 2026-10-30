import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { BotFormData } from '@/schemas/botFormSchema';
import { CheckCircle, Copy, RefreshCw, Trash2 } from 'lucide-react';

import { BotUsageSummary } from '@/components/bots/BotUsageSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BotDeploymentStepProps {
  botId?: number;
}

const BotDeploymentStep: React.FC<BotDeploymentStepProps> = ({ botId }) => {
  const { register, control, setValue, watch } = useFormContext<BotFormData>();
  const [copySuccess, setCopySuccess] = useState(false);
  const [customCode, setCustomCode] = useState('');

  const accessCode = watch('accessCode');
  const isPubliclyDeployed = watch('isPubliclyDeployed');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateCode = (useCustom = false) => {
    const codeToUse = useCustom ? customCode.trim().toUpperCase() : generateRandomCode();
    setValue('accessCode', codeToUse);
    setCustomCode('');
  };

  const handleRegenerateCode = () => {
    const newCode = generateRandomCode();
    setValue('accessCode', newCode);
  };

  const handleDeleteCode = () => {
    setValue('accessCode', '');
    setValue('accessCodeLimit', 0);
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

  const getPublicBotUrl = () => {
    return botId ? `${window.location.origin}/public-deployment/bot/${botId}` : '';
  };

  return (
    <div className="space-y-6">
      {botId && (
        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <Label className="text-base font-medium">Usage</Label>
            <p className="text-muted-foreground text-xs">What chats with this bot have cost.</p>
          </div>
          <BotUsageSummary botId={botId} />
        </div>
      )}

      {/* Subscription Code Section */}
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <Label className="text-base font-medium">
            {accessCode ? 'Bot Subscription Code' : 'Generate Subscription Code'}
          </Label>
          <p className="text-muted-foreground text-xs">
            {accessCode
              ? 'Students can use this code to access this bot.'
              : 'Generate a subscription code for students to access this bot.'}
          </p>
        </div>

        {!accessCode ? (
          /* No subscription code - show generation UI */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customCode">Custom Subscription Code (Optional)</Label>
              <Input
                id="customCode"
                value={customCode}
                onChange={e => setCustomCode(e.target.value.toUpperCase())}
                className="font-mono"
                placeholder="Enter custom code or leave empty for random"
              />
              <p className="text-muted-foreground text-xs">
                Leave empty to generate a random code, or enter a custom code that's memorable.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => handleGenerateCode(false)}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Random Code
              </Button>

              {customCode.trim() && (
                <Button type="button" onClick={() => handleGenerateCode(true)} size="sm">
                  Use Custom Code
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Has subscription code - show management UI */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Subscription Code</Label>
              <div className="flex gap-2">
                <Input
                  id="accessCode"
                  {...register('accessCode')}
                  className="font-mono"
                  placeholder="Subscription code"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="shrink-0"
                >
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
              <p className="text-muted-foreground text-xs">
                You can customize this subscription code. Click "Save Changes" to apply.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessCodeLimit">Redemption Limit</Label>
              <Input
                id="accessCodeLimit"
                type="number"
                min={0}
                {...register('accessCodeLimit', { valueAsNumber: true })}
                placeholder="0"
              />
              <p className="text-muted-foreground text-xs">
                Maximum number of students who can redeem this code. 0 = unlimited.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={handleRegenerateCode}>
                <RefreshCw className="mr-1 h-4 w-4" />
                Regenerate
              </Button>
              <Button type="button" size="sm" variant="destructive" onClick={handleDeleteCode}>
                <Trash2 className="mr-1 h-4 w-4" />
                Delete Code
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Public Deployment */}
      <div className="space-y-4 rounded-lg border p-4">
        <Controller
          name="isPubliclyDeployed"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPubliclyDeployed" className="text-base font-medium">
                  Public Deployment
                </Label>
                <p className="text-muted-foreground text-xs">
                  Allow anyone with the link to access this bot without logging in
                </p>
              </div>
              <Switch
                id="isPubliclyDeployed"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />

        {isPubliclyDeployed && botId && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Limit (USD)</Label>
              <Input
                id="budget"
                type="number"
                min="1"
                max="20"
                step="0.01"
                {...register('budget')}
                placeholder="1.00"
              />
              <p className="text-muted-foreground text-xs">
                Set a budget limit for anonymous public usage (minimum $1, maximum $20).
              </p>
            </div>

            <div className="space-y-2">
              <Label>Public URL</Label>
              <div className="flex gap-2">
                <Input value={getPublicBotUrl()} readOnly className="font-mono text-sm" />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(getPublicBotUrl());
                  }}
                  className="shrink-0"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Share this URL to allow anonymous access.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* How Students Access */}
      <div className="rounded-lg border p-4">
        <Label className="text-base font-medium">How Students Access This Bot</Label>
        <div className="text-muted-foreground mt-2 space-y-1 text-sm">
          <p>1. Students log into the Socratic Bots platform</p>
          <p>2. They enter the subscription code to gain access</p>
          <p>3. Once redeemed, they can start chatting immediately</p>
        </div>
      </div>
    </div>
  );
};

export default BotDeploymentStep;
