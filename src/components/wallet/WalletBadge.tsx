import { useState } from 'react';

import { ChevronDown, CreditCard } from 'lucide-react';

import { useWallet } from '@/hooks/queries/useWallet';

import { cn } from '@/lib/utils';

import { formatUsd } from '@/utils/wallets';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { WalletDrawer } from './WalletDrawer';

/**
 * Top-bar wallet trigger, shaped like DARE's: the active wallet's balance (or
 * "External" for BYO / LiteLLM, which the user pays outside DARE) next to its
 * name. Opens the wallet popover.
 */
export const WalletBadge = () => {
  const { data, isLoading, isError } = useWallet();
  const [open, setOpen] = useState(false);

  const active = data?.wallets.find(wallet => wallet.isActive);
  const label = active?.label ?? 'DARE Wallet';
  let amount: string;
  if (isLoading) {
    amount = '…';
  } else if (isError || !data) {
    amount = '—';
  } else if (active?.status.kind === 'BALANCE') {
    amount = formatUsd(active.status.balance);
  } else {
    amount = 'External';
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Wallet: ${label} (${amount})`}
          className={cn(
            'group border-primary/20 bg-background text-foreground inline-flex items-center gap-2',
            'rounded-full border py-0.5 pr-3 pl-0.5 text-sm font-medium shadow-xs transition-all',
            'hover:border-primary/50 hover:shadow-md'
          )}
        >
          <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full">
            <CreditCard className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold tabular-nums">{amount}</span>
          <span className="bg-border hidden h-3 w-px sm:inline-block" />
          <span className="text-muted-foreground hidden max-w-[110px] truncate text-xs sm:inline">
            {label}
          </span>
          <ChevronDown className="text-muted-foreground h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] overflow-hidden p-0">
        <WalletDrawer />
      </PopoverContent>
    </Popover>
  );
};
