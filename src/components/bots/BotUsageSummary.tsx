import { Loader2 } from 'lucide-react';

import { useBotUsage } from '@/hooks/queries/useWallet';

import { formatCurrency } from '@/utils/formatters';

interface BotUsageSummaryProps {
  botId: number;
}

/**
 * What this bot has cost so far. Students pay DARE-model chats from their own
 * wallets; LiteLLM-model chats run on the owner's key, priced here at DARE's
 * reference rates since the gateway bills the owner directly.
 */
export const BotUsageSummary = ({ botId }: BotUsageSummaryProps) => {
  const { data, isLoading, isError } = useBotUsage(botId);

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }
  if (isError || !data) {
    return <p className="text-muted-foreground text-sm">Usage isn&apos;t available right now.</p>;
  }

  const { totals } = data;
  return (
    <div className="grid grid-cols-3 gap-3">
      <UsageStat
        label="Paid by students"
        value={formatCurrency(totals.totalCost, { decimals: 4 })}
      />
      <UsageStat
        label="Your LiteLLM spend"
        value={formatCurrency(totals.sponsoredCost, { decimals: 4 })}
      />
      <UsageStat label="Replies" value={String(totals.messageCount)} />
    </div>
  );
};

const UsageStat = ({ label, value }: { label: string; value: string }) => (
  <div className="border-border rounded-md border p-3">
    <div className="text-muted-foreground text-xs">{label}</div>
    <div className="text-lg font-semibold tabular-nums">{value}</div>
  </div>
);
