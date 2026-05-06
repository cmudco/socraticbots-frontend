import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { BotFormData } from '@/schemas/botFormSchema';

import { formatCurrency } from '@/utils/formatters';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { BillingSource } from '@/types/bot';

/**
 * Billing tab on the bot edit page.
 *
 * Owner-only knobs:
 *  - **Cap** (`Bot.budget`) — editable inline. Required before public deploy.
 *  - **Billing source** — picks who pays (OWNER / GROUP / USER / LITELLM).
 *  - **Live spend meter** — shows `budget_used` against `budget` with 80%/100%
 *    colored thresholds so the professor can see they're approaching the cap
 *    without leaving SocraticBooks.
 *
 * Uses RHF FormContext (same as every other bot step) so the parent's save
 * action commits via `BotSerializer` which validates the invariants set up
 * server-side.
 */

interface Props {
  botGroupId: number;
  botId: number;
  budgetUsed?: number;
}

export const BotBillingTab: React.FC<Props> = ({ budgetUsed = 0 }) => {
  const { control, watch, setValue } = useFormContext<BotFormData>();

  const budgetStr = watch('budget');
  const billingSource = watch('billingSource');
  const isPubliclyDeployed = watch('isPubliclyDeployed');

  const [error, setError] = useState<string | null>(null);

  const numericBudget = Number(budgetStr);
  const cap = Number.isFinite(numericBudget) && numericBudget > 0 ? numericBudget : 0;
  const pct = cap > 0 ? Math.min(100, Math.round((budgetUsed / cap) * 100)) : 0;

  const onApplyCap = () => {
    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      setError('Cap must be a positive amount.');
      return;
    }
    if (numericBudget < budgetUsed) {
      setError(`Cap cannot go below current usage (${formatCurrency(budgetUsed)}).`);
      return;
    }
    setError(null);
    setValue('budget', budgetStr, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spend Cap</CardTitle>
          <CardDescription>
            Hard ceiling on total LLM spend for this bot. Required when the bot is publicly
            deployed. The cap protects against runaway cost — actual money flow is set below by
            Billing Source.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g. 50.00"
                />
              )}
            />
            <Button type="button" onClick={onApplyCap}>
              Apply
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>
                {formatCurrency(budgetUsed)} of {formatCurrency(cap)}
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <Progress value={pct} />
            {pct >= 100 && (
              <p className="text-destructive mt-1 text-xs">
                Cap reached. Raise the cap to allow new traffic.
              </p>
            )}
            {pct >= 80 && pct < 100 && (
              <p className="mt-1 text-xs text-amber-600">
                Approaching cap (80%+). Consider raising it.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Source</CardTitle>
          <CardDescription>
            Who pays for LLM calls when someone uses this bot. Public bots must use OWNER_WALLET —
            anonymous users have no cohort to attribute to.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Source</Label>
            <Controller
              name="billingSource"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={v => field.onChange(v as BillingSource)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OWNER_WALLET">Owner&apos;s DARE wallet (you pay)</SelectItem>
                    <SelectItem value="GROUP_WALLET" disabled={isPubliclyDeployed}>
                      Cohort wallet (institution pays)
                    </SelectItem>
                    <SelectItem value="USER_WALLET">
                      Calling user&apos;s wallet (student pays)
                    </SelectItem>
                    <SelectItem value="LITELLM_KEY">
                      LiteLLM proxy key (external billing)
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {(billingSource === 'GROUP_WALLET' || billingSource === 'LITELLM_KEY') && (
            <div className="space-y-2">
              <Label>
                {billingSource === 'GROUP_WALLET' ? 'Access code (cohort)' : 'LiteLLM key id'}
              </Label>
              <Controller
                name="billingTargetId"
                control={control}
                render={({ field }) => (
                  <Input
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value || null)}
                    placeholder={billingSource === 'GROUP_WALLET' ? 'e.g. PHIL101-S26' : 'UUID'}
                  />
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BotBillingTab;
