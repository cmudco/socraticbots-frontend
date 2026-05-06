import { useState } from 'react';

import { Loader2 } from 'lucide-react';

import { useBotUsage } from '@/hooks/queries/useWallet';

import { formatCurrency } from '@/utils/formatters';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Owner-only per-user usage breakdown for a bot.
 *
 * Pulls from `/api/wallet/bots/{id}/usage/?group_by=user` (proxied through SB
 * to DARE). Anonymous public-bot rows arrive bucketed by session hash; we
 * render them as `Anonymous-…` so the dashboard distinguishes individual
 * sessions without revealing the raw session id.
 *
 * CSV export is intentionally a client-side download — the data is small and
 * we don't want to add another endpoint just for content-disposition.
 */

type Period = '7d' | '30d' | '90d' | 'all';

interface Props {
  botGroupId: number;
  botId: number;
}

export const BotUsageTab: React.FC<Props> = ({ botId }) => {
  const [period, setPeriod] = useState<Period>('30d');
  const { data, isLoading, isError, error } = useBotUsage(botId, {
    groupBy: 'user',
    period,
  });

  const exportCsv = () => {
    const rows = data?.userBreakdown;
    if (!rows) return;
    const header = [
      'user_id',
      'user_email',
      'total_cost',
      'input_tokens',
      'output_tokens',
      'message_count',
    ];
    const body = rows
      .map(r =>
        [
          r.userId ?? '',
          r.userEmail,
          r.totalCost,
          r.inputTokens,
          r.outputTokens,
          r.messageCount,
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([`${header.join(',')}\n${body}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-${botId}-usage-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Per-user Usage</CardTitle>
          <CardDescription>
            Cost and token breakdown for everyone who used this bot in the selected window.
            Anonymous sessions are bucketed by session id hash.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={v => setPeriod(v as Period)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!data}>
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-destructive text-sm">
            Failed to load usage{error instanceof Error ? `: ${error.message}` : ''}
          </p>
        ) : !data ? (
          <p className="text-muted-foreground text-sm">No data.</p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Total cost</div>
                <div className="font-semibold">{formatCurrency(data.totals.totalCost)}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Tokens</div>
                <div className="font-semibold">
                  {(data.totals.totalInputTokens + data.totals.totalOutputTokens).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Messages</div>
                <div className="font-semibold">{data.totals.messageCount}</div>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="py-2 text-left">User</th>
                  <th className="py-2 text-right">Cost</th>
                  <th className="py-2 text-right">Tokens</th>
                  <th className="py-2 text-right">Messages</th>
                </tr>
              </thead>
              <tbody>
                {(data.userBreakdown ?? []).map(row => (
                  <tr key={`${row.userId}-${row.userEmail}`} className="border-t">
                    <td className="py-2">{row.userEmail}</td>
                    <td className="py-2 text-right">{formatCurrency(row.totalCost)}</td>
                    <td className="py-2 text-right">
                      {(row.inputTokens + row.outputTokens).toLocaleString()}
                    </td>
                    <td className="py-2 text-right">{row.messageCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BotUsageTab;
