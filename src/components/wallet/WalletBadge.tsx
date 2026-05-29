import { useState } from 'react';

import { Wallet as WalletIcon } from 'lucide-react';

import { useWallet } from '@/hooks/queries/useWallet';

import { cn } from '@/lib/utils';

import { formatCurrency } from '@/utils/formatters';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { WalletDrawer } from './WalletDrawer';

/**
 * Top-bar wallet widget — mirrors DARE's wallet header so SocraticBooks users
 * can see their balance and recent activity without leaving SB.
 *
 * Shows the active wallet's "headline" value:
 *  - DARE wallet active → balance ($X.XX)
 *  - BYO active        → "BYO" badge (no balance — the user pays externally)
 *  - LiteLLM active    → "LiteLLM" badge (same reason)
 */
export const WalletBadge = () => {
  const { data, isLoading, isError } = useWallet();
  const [open, setOpen] = useState(false);

  const active = data?.activeWallet;
  const activeWallet = data?.wallets.find(
    w =>
      w.type === active?.type &&
      ((w.refId ?? null) === (active?.refId ?? null) || (active?.refId == null && w.refId == null))
  );

  let label: string;
  if (isLoading) {
    label = '…';
  } else if (isError || !data) {
    label = '—';
  } else if (active?.type === 'DARE' && activeWallet?.status.kind === 'BALANCE') {
    label = formatCurrency(activeWallet.status.balance);
  } else if (active?.type === 'BYO') {
    label = 'BYO';
  } else if (active?.type === 'LITELLM') {
    label = 'LiteLLM';
  } else {
    label = '$0.00';
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'border-border flex h-9 items-center gap-2 rounded-full border px-3',
            'hover:bg-muted text-sm font-medium'
          )}
          aria-label="Open wallet"
        >
          <WalletIcon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <WalletDrawer />
      </PopoverContent>
    </Popover>
  );
};
