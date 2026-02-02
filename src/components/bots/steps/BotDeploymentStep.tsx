import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { BotFormData } from '@/schemas/botFormSchema';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const BotDeploymentStep: React.FC = () => {
  const { register, control } = useFormContext<BotFormData>();

  return (
    <div className="space-y-6">
      {/* Access Code */}
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <Label htmlFor="accessCode">Access Code</Label>
          <p className="text-muted-foreground text-xs">
            Users can enter this code to access the bot
          </p>
        </div>
        <Input id="accessCode" {...register('accessCode')} placeholder="e.g., MATH2024" />

        <div className="space-y-2">
          <Label htmlFor="accessCodeLimit">Usage Limit</Label>
          <p className="text-muted-foreground text-xs">
            Maximum number of times this code can be used (0 = unlimited)
          </p>
          <Input
            id="accessCodeLimit"
            type="number"
            min={0}
            {...register('accessCodeLimit', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Public Deployment */}
      <div className="rounded-lg border p-4">
        <Controller
          name="isPubliclyDeployed"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPubliclyDeployed">Public Deployment</Label>
                <p className="text-muted-foreground text-xs">
                  Allow anyone with the link to access this bot
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
      </div>

      {/* Budget */}
      <div className="space-y-2 rounded-lg border p-4">
        <Label htmlFor="budget">Budget Limit</Label>
        <p className="text-muted-foreground text-xs">
          Maximum spending limit for this bot (in credits)
        </p>
        <Input id="budget" {...register('budget')} placeholder="Leave empty for no limit" />
      </div>
    </div>
  );
};

export default BotDeploymentStep;
