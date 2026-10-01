import { useState } from 'react';

import { KeyRound, Loader2, Network, Plus, Settings2 } from 'lucide-react';

import { useWallet } from '@/hooks/queries/useWallet';

import { formatBalanceOfCeiling } from '@/utils/wallets';

import { Button } from '@/components/ui/button';

import { AddLiteLLMKeyDialog } from './AddLiteLLMKeyDialog';
import { ByoKeysDialog } from './ByoKeysDialog';
import { WalletRow } from './WalletRow';

/**
 * Resolve the deeplink to DARE's billing screen from `VITE_DARE_FRONTEND_URL`
 * (no trailing slash). Falls back to DARE's conventional dev port, 5173.
 */
const resolveDareBillingUrl = (): string => {
  const raw = import.meta.env.VITE_DARE_FRONTEND_URL as string | undefined;
  const base = (raw ?? 'http://localhost:5173').replace(/\/+$/, '');
  return `${base}/billing/`;
};

/**
 * Wallet popover body — the same layout as DARE's: the active wallet up top
 * with a link to manage it in DARE, every wallet to switch between, and
 * quick-add buttons for the wallet types enabled for this user.
 */
export const WalletDrawer = () => {
  const { data: walletsResp, isLoading } = useWallet();
  const [addingLiteLLM, setAddingLiteLLM] = useState(false);
  const [managingByo, setManagingByo] = useState(false);

  if (isLoading || !walletsResp) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const active = walletsResp.wallets.find(wallet => wallet.isActive);

  return (
    <div className="flex max-h-[80vh] flex-col">
      <div className="bg-primary text-primary-foreground flex items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wider uppercase opacity-80">
            Active wallet
          </p>
          <p className="mt-0.5 truncate text-base font-semibold">
            {active?.label ?? 'DARE Wallet'}
          </p>
          <p className="text-xs opacity-85">
            {active?.status.kind === 'BALANCE'
              ? formatBalanceOfCeiling(active.status)
              : 'External billing — your DARE wallet is not charged'}
          </p>
        </div>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 h-8 shadow-none"
        >
          <a href={resolveDareBillingUrl()} target="_blank" rel="noopener noreferrer">
            <Settings2 className="mr-1 h-3.5 w-3.5" />
            Manage
          </a>
        </Button>
      </div>

      <div className="max-h-80 overflow-y-auto px-3 py-3">
        <p className="text-muted-foreground mb-2 px-1 text-[11px] font-semibold tracking-wider uppercase">
          Switch default
        </p>
        <div className="space-y-2">
          {walletsResp.wallets.map(wallet => (
            <WalletRow key={`${wallet.type}:${wallet.refId ?? 'none'}`} wallet={wallet} />
          ))}
        </div>
      </div>

      {(walletsResp.litellmEnabled || walletsResp.byoEnabled) && (
        <div className="border-border flex gap-2 border-t px-3 py-3">
          {walletsResp.litellmEnabled && (
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 flex-1"
              onClick={() => setAddingLiteLLM(true)}
            >
              <Network className="mr-1 h-3.5 w-3.5" />
              <Plus className="mr-1 h-3 w-3" />
              LiteLLM Key
            </Button>
          )}
          {walletsResp.byoEnabled && (
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 flex-1"
              onClick={() => setManagingByo(true)}
            >
              <KeyRound className="mr-1 h-3.5 w-3.5" />
              <Plus className="mr-1 h-3 w-3" />
              BYO Key
            </Button>
          )}
        </div>
      )}

      <AddLiteLLMKeyDialog open={addingLiteLLM} onClose={() => setAddingLiteLLM(false)} />
      <ByoKeysDialog open={managingByo} onClose={() => setManagingByo(false)} />
    </div>
  );
};
