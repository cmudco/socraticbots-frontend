import React, { useState } from 'react';

import { CheckCircle, Copy, RefreshCw } from 'lucide-react';

import { useUpdateBotGroupAccessCode } from '@/hooks/queries/useBotGroups';
import { useIsCreator } from '@/hooks/queries/useUser';

import { useBotGroupFormStore } from '@/stores/forms/botGroupFormStore';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BotGroupDeploymentTabProps {
  botGroupId: number;
}

const BotGroupDeploymentTab: React.FC<BotGroupDeploymentTabProps> = ({ botGroupId }) => {
  const isCreator = useIsCreator();
  const { accessCode, accessCodeLimit, updateAccessCode, updateAccessCodeLimit } =
    useBotGroupFormStore();

  const updateAccessCodeMutation = useUpdateBotGroupAccessCode();

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

  const handleGenerateCode = (useCustom = false) => {
    const code = useCustom ? customCode.trim() : generateRandomCode();
    updateAccessCode(code);
    setCustomCode('');
  };

  const handleSaveAccessCode = async () => {
    try {
      await updateAccessCodeMutation.mutateAsync({
        id: botGroupId,
        accessCodeData: {
          accessCode,
          accessCodeLimit,
        },
      });
    } catch (error) {
      console.error('Failed to save subscription code:', error);
    }
  };

  const handleDeleteAccessCode = async () => {
    try {
      await updateAccessCodeMutation.mutateAsync({
        id: botGroupId,
        accessCodeData: {
          accessCode: '',
          accessCodeLimit: 0,
        },
      });
      updateAccessCode('');
      updateAccessCodeLimit(0);
    } catch (error) {
      console.error('Failed to delete subscription code:', error);
    }
  };

  const handleCopyCode = async () => {
    if (!accessCode) return;
    try {
      await navigator.clipboard.writeText(accessCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isCreator) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        Deployment features are only available for creators.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {accessCode ? 'Bot Group Subscription Code' : 'Generate Subscription Code'}
          </CardTitle>
          <CardDescription>
            {accessCode
              ? 'Students can use this code to access ALL bots in this bot group.'
              : 'Generate a subscription code for students to access all bots in this group.'}
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
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleGenerateCode(false)} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Random
                </Button>
                {customCode.trim() && (
                  <Button onClick={() => handleGenerateCode(true)}>Use Custom Code</Button>
                )}
              </div>
            </div>
          )}

          {accessCode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Subscription Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="access-code"
                    value={accessCode}
                    onChange={e => updateAccessCode(e.target.value)}
                    className="font-mono"
                  />
                  <Button size="sm" variant="outline" onClick={handleCopyCode}>
                    {copySuccess ? (
                      <>
                        <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Redemption Limit (0 = unlimited)</Label>
                <Input
                  id="limit"
                  type="number"
                  min={0}
                  value={accessCodeLimit}
                  onChange={e => updateAccessCodeLimit(Number(e.target.value))}
                />
              </div>

              <div className="flex gap-2 border-t pt-4">
                <Button
                  onClick={handleSaveAccessCode}
                  disabled={updateAccessCodeMutation.isPending}
                >
                  {updateAccessCodeMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateCode(false)}
                  disabled={updateAccessCodeMutation.isPending}
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Regenerate
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccessCode}
                  disabled={updateAccessCodeMutation.isPending}
                >
                  Delete Code
                </Button>
              </div>

              {copySuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Code copied to clipboard!</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Students Access This Bot Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>1. Students log into Socratic Books</p>
            <p>2. Enter the subscription code to unlock ALL bots in this group</p>
            <p>3. Start chatting with any bot immediately</p>
            <p className="mt-4 font-semibold">
              Note: One code gives access to all current and future bots in this group.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotGroupDeploymentTab;
