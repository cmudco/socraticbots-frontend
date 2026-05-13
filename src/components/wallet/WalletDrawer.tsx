import { ExternalLink, Loader2 } from 'lucide-react';

import { useEffectivePolicy, useWallet, useWalletTransactions } from '@/hooks/queries/useWallet';

import { formatCurrency, formatShortDate } from '@/utils/formatters';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { ActiveWalletType, TransactionRow, WalletEntry } from '@/types/wallet';

const ACTIVE_LABEL: Record<ActiveWalletType, string> = {
  DARE: 'DARE Wallet',
  BYO: 'Your Provider Keys',
  LITELLM: 'LiteLLM Proxy',
};

/**
 * Resolve the deeplink to DARE's billing screen.
 *
 * Reads `VITE_DARE_FRONTEND_URL` (no trailing slash). Falls back to
 * `http://localhost:5173` for the conventional dev port — the SB-react Vite
 * server typically lands on 5174 because dare-frontend already holds 5173.
 * The route is `/billing/` per dare-frontend's AppRoutes.
 *
 * Bug fix: previous code used `?? '#'` which, on a `<a href>`, resolves
 * relative to the current page and dumped users on `<current-page>#`
 * (e.g. `/settings#`) instead of opening DARE.
 */
const resolveDareBillingUrl = (): string => {
  const raw = import.meta.env.VITE_DARE_FRONTEND_URL as string | undefined;
  const base = (raw ?? 'http://localhost:5173').replace(/\/+$/, '');
  return `${base}/billing/`;
};

/**
 * Expanded wallet panel reachable from the WalletBadge popover.
 *
 * Sections (top-to-bottom):
 * 1. Active-wallet headline — balance for DARE, explanatory text for BYO/LiteLLM
 *    so users on external billing don't read a "$0.00" balance as "I'm broke"
 * 2. Refill policy — next refill date + the source tier (USER/GROUP/SYSTEM)
 *    so cohort members can see when their institution funds them next
 * 3. Recent SB transactions — last 5 SocraticBooks-platform debits
 * 4. Deeplink to the full DARE wallet page for management
 */
export const WalletDrawer = () => {
  const { data: walletsResp, isLoading } = useWallet();
  const { data: txnResp, isLoading: txnLoading } = useWalletTransactions('SocraticBots');
  const { data: policy } = useEffectivePolicy();
  const dareBillingUrl = resolveDareBillingUrl();

  if (isLoading || !walletsResp) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const active = walletsResp.activeWallet;
  const activeWallet: WalletEntry | undefined = walletsResp.wallets.find(
    w =>
      w.type === active.type &&
      ((w.refId ?? null) === (active.refId ?? null) || (active.refId == null && w.refId == null))
  );

  return (
    <div className="flex max-h-[80vh] flex-col gap-4 p-4">
      {/* --- Active wallet headline ------------------------------------- */}
      <section>
        <div className="text-muted-foreground text-xs uppercase">Active wallet</div>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">{ACTIVE_LABEL[active.type]}</span>
            {active.type !== 'DARE' && (
              <Badge variant="secondary" className="text-[10px]">
                External billing
              </Badge>
            )}
          </div>
          {active.type === 'DARE' && activeWallet?.status.kind === 'BALANCE' && (
            <span className="text-lg font-semibold">
              {formatCurrency(activeWallet.status.balance)}
            </span>
          )}
        </div>
        {active.type !== 'DARE' && (
          <p className="text-muted-foreground mt-1 text-xs">
            Your DARE wallet is not charged for these calls — costs are paid via your own keys.
          </p>
        )}
      </section>

      {/* --- Refill policy ---------------------------------------------- */}
      {policy && active.type === 'DARE' && (
        <section className="border-border rounded-md border p-3">
          <div className="text-muted-foreground text-xs uppercase">Refill</div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span>
              {formatCurrency(policy.amount)} every {policy.periodDays} days
            </span>
            <Badge variant="outline" className="text-[10px]">
              {policy.amountSource}
            </Badge>
          </div>
        </section>
      )}

      {/* --- Recent SB transactions ------------------------------------- */}
      <section>
        <div className="text-muted-foreground text-xs uppercase">Recent activity</div>
        {txnLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : txnResp?.results?.length ? (
          <ul className="divide-border mt-2 divide-y">
            {txnResp.results.slice(0, 5).map((row: TransactionRow) => (
              <li key={row.id} className="flex items-start justify-between py-2">
                <div className="min-w-0 flex-1 pr-3">
                  <div className="truncate text-sm">{row.message || row.source}</div>
                  <div className="text-muted-foreground text-xs">
                    {formatShortDate(row.createdAt)}
                    {row.llmName ? ` · ${row.llmName}` : ''}
                  </div>
                </div>
                <span className="text-sm font-medium">{formatCurrency(row.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-muted-foreground mt-2 text-sm">No SocraticBooks activity yet.</div>
        )}
      </section>

      {/* --- Deeplink to DARE wallet ------------------------------------ */}
      <section className="border-border border-t pt-3">
        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={dareBillingUrl} target="_blank" rel="noopener noreferrer">
            Manage in DARE
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </section>
    </div>
  );
};
