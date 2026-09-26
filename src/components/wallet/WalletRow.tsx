import { useState } from 'react';

import { CheckCircle2, KeyRound, Loader2, MoreVertical, Network, Wallet } from 'lucide-react';

import { useDeleteLiteLLMKey, useSetActiveWallet } from '@/hooks/queries/useWallet';

import { useToastStore } from '@/stores/ui/toastStore';

import { walletService } from '@/services/wallet.service';

import { cn } from '@/lib/utils';

import { formatCurrency } from '@/utils/formatters';

import { Badge } from '@/components/ui/badge';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { WalletEntry } from '@/types/wallet';

const ICONS = { DARE: Wallet, BYO: KeyRound, LITELLM: Network } as const;

const describe = (wallet: WalletEntry): string => {
  if (wallet.status.kind === 'BALANCE') {
    return `Balance: ${formatCurrency(wallet.status.balance)}`;
  }
  if (wallet.type === 'LITELLM' && wallet.groupName) {
    return `Group key · ${wallet.groupName}`;
  }
  return 'External billing';
};

interface WalletRowProps {
  wallet: WalletEntry;
}

/**
 * One wallet in the switcher: click to make it the default. The user's own
 * LiteLLM keys also get test and remove; removing one first lists the bots
 * that would stop answering.
 */
export const WalletRow = ({ wallet }: WalletRowProps) => {
  const { addToast } = useToastStore();
  const setActive = useSetActiveWallet();
  const deleteKey = useDeleteLiteLLMKey();
  const [dependents, setDependents] = useState<string[] | null>(null);
  const [testing, setTesting] = useState(false);

  const Icon = ICONS[wallet.type];
  const ownKey = wallet.type === 'LITELLM' && wallet.source === 'USER' && !!wallet.refId;

  const activate = () => {
    if (wallet.isActive || setActive.isPending) return;
    setActive.mutate(
      { type: wallet.type, refId: wallet.refId },
      {
        onError: error =>
          addToast({ type: 'error', message: error.message || 'Could not switch wallet.' }),
      }
    );
  };

  const test = async () => {
    setTesting(true);
    try {
      const result = await walletService.testSavedLiteLLMKey(wallet.refId as string);
      addToast(
        result.ok
          ? { type: 'success', message: `Connected — ${result.models.length} models available.` }
          : { type: 'error', message: result.error || 'Connection failed.' }
      );
    } catch (error) {
      addToast({ type: 'error', message: (error as Error).message });
    } finally {
      setTesting(false);
    }
  };

  const askToRemove = async () => {
    try {
      const { bots } = await walletService.getLiteLLMKeyDependents(wallet.refId as string);
      setDependents(bots.map(bot => bot.botTitle));
    } catch (error) {
      addToast({ type: 'error', message: (error as Error).message });
    }
  };

  const removeDescription = dependents?.length
    ? `${dependents.length} bot${dependents.length === 1 ? ' uses' : 's use'} this key ` +
      `(${dependents.join(', ')}). Removing it turns ${
        dependents.length === 1 ? 'it' : 'them'
      } off until you pick another model.`
    : 'No bots use this key. This cannot be undone.';

  return (
    <>
      <div
        role={wallet.isActive ? undefined : 'button'}
        onClick={activate}
        className={cn(
          'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
          wallet.isActive
            ? 'border-primary/40 bg-primary/5 cursor-default'
            : 'border-border hover:bg-muted cursor-pointer'
        )}
      >
        <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{wallet.label}</div>
          <div className="text-muted-foreground truncate text-xs">{describe(wallet)}</div>
        </div>
        {setActive.isPending && setActive.variables?.refId === wallet.refId ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : wallet.isActive ? (
          <Badge className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        ) : null}
        {ownKey && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={event => event.stopPropagation()}>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground rounded p-1"
                aria-label={`Manage ${wallet.label}`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={event => event.stopPropagation()}>
              <DropdownMenuItem disabled={testing} onClick={test}>
                {testing ? 'Testing…' : 'Test connection'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={askToRemove}>
                Remove key
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ConfirmationModal
        isOpen={dependents !== null}
        onClose={() => setDependents(null)}
        onConfirm={() =>
          deleteKey.mutate(wallet.refId as string, {
            onSuccess: () => addToast({ type: 'success', message: 'LiteLLM key removed.' }),
            onError: error => addToast({ type: 'error', message: error.message }),
          })
        }
        title={`Remove "${wallet.label}"?`}
        description={removeDescription}
        confirmText="Remove key"
        isLoading={deleteKey.isPending}
      />
    </>
  );
};
