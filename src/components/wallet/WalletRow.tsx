import { useState } from 'react';

import { LiteLLMKeySource, WalletScopedType } from '@/constants/wallet';
import {
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  MoreVertical,
  Network,
  Plug,
  Trash2,
  Wallet,
} from 'lucide-react';

import {
  useDeleteLiteLLMKey,
  useLiteLLMKeyDependents,
  useSetActiveWallet,
  useTestSavedLiteLLMKey,
} from '@/hooks/queries/useWallet';

import { useToastStore } from '@/stores/ui/toastStore';

import { cn } from '@/lib/utils';

import { byoProviders, formatBalanceOfCeiling, formatUsd } from '@/utils/wallets';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { WalletEntry } from '@/types/wallet';

const ICONS = {
  [WalletScopedType.DARE]: Wallet,
  [WalletScopedType.BYO]: KeyRound,
  [WalletScopedType.LITELLM]: Network,
} as const;

interface WalletRowProps {
  wallet: WalletEntry;
}

/**
 * One wallet in the switcher, with the same detail DARE's popover shows: the
 * DARE balance, the providers a BYO wallet covers, a LiteLLM key's estimated
 * cost or group allowance, and its expiry. Click to make it the default. Own
 * LiteLLM keys can be tested or removed; removing lists the bots that use it.
 */
export const WalletRow = ({ wallet }: WalletRowProps) => {
  const { addToast } = useToastStore();
  const setActive = useSetActiveWallet();
  const deleteKey = useDeleteLiteLLMKey();
  const testKey = useTestSavedLiteLLMKey();
  const findDependents = useLiteLLMKeyDependents();
  const [dependents, setDependents] = useState<string[] | null>(null);

  const Icon = ICONS[wallet.type];
  const isLiteLLM = wallet.type === WalletScopedType.LITELLM;
  const ownKey = isLiteLLM && wallet.source === LiteLLMKeySource.USER && !!wallet.refId;
  const providers = wallet.type === WalletScopedType.BYO ? byoProviders(wallet) : [];
  // DARE and BYO rows both have refId null, so the type tells them apart.
  const switching =
    setActive.isPending &&
    setActive.variables?.type === wallet.type &&
    setActive.variables?.refId === wallet.refId;

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

  const test = () =>
    testKey.mutate(wallet.refId as string, {
      onSuccess: result =>
        addToast(
          result.ok
            ? { type: 'success', message: `Connected — ${result.models.length} models available.` }
            : { type: 'error', message: result.error || 'Connection failed.' }
        ),
      onError: error => addToast({ type: 'error', message: error.message }),
    });

  const askToRemove = () =>
    findDependents.mutate(wallet.refId as string, {
      onSuccess: ({ bots }) => setDependents(bots.map(bot => bot.botTitle)),
      onError: error => addToast({ type: 'error', message: error.message }),
    });

  const removeDescription = dependents?.length
    ? `${dependents.length} bot${dependents.length === 1 ? ' uses' : 's use'} this key ` +
      `(${dependents.join(', ')}). Removing it turns ${
        dependents.length === 1 ? 'it' : 'them'
      } off until you pick another model.`
    : 'No bots use this key. This cannot be undone.';

  const status = wallet.status;

  return (
    <>
      <div
        role={wallet.isActive ? undefined : 'button'}
        onClick={activate}
        className={cn(
          'group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
          wallet.isActive
            ? 'border-primary/40 bg-primary/5 cursor-default'
            : 'border-border hover:border-primary/30 hover:bg-muted cursor-pointer'
        )}
      >
        <Icon className="text-muted-foreground h-4 w-4 shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-medium">{wallet.label}</span>
            {providers.length > 0 && (
              <>
                <Badge className="bg-primary/15 text-primary border-0 text-[10px] font-semibold tracking-wide uppercase">
                  {providers.length} {providers.length === 1 ? 'key' : 'keys'} configured
                </Badge>
                {providers.map(name => (
                  <Badge key={name} variant="outline" className="text-[10px]">
                    {name}
                  </Badge>
                ))}
              </>
            )}
            {isLiteLLM && wallet.source === LiteLLMKeySource.ADMIN_GROUP && wallet.groupName && (
              <Badge variant="outline" className="text-[10px]">
                Issued by {wallet.groupName}
              </Badge>
            )}
            {isLiteLLM && wallet.source === LiteLLMKeySource.ADMIN_USER && (
              <Badge variant="outline" className="text-[10px]">
                Admin-issued
              </Badge>
            )}
          </div>

          <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
            {status.kind === 'BALANCE' ? (
              <span>Balance: {formatBalanceOfCeiling(status)}</span>
            ) : wallet.type === WalletScopedType.BYO ? (
              <span>
                Routes each request to your matching provider key — DARE wallet not charged.
              </span>
            ) : wallet.source === LiteLLMKeySource.ADMIN_GROUP ? (
              <span>Billed to your group&apos;s gateway</span>
            ) : (
              <span>External billing</span>
            )}
            {status.kind === 'EXTERNAL' &&
              (status.spendLimit ? (
                <span
                  className={
                    status.spendLimit.isReached ? 'text-destructive font-medium' : undefined
                  }
                >
                  Used {formatUsd(status.spendLimit.used)} of {formatUsd(status.spendLimit.limit)}{' '}
                  allowance
                </span>
              ) : (
                status.spend && <span>Est. cost ${Number(status.spend).toFixed(4)}</span>
              ))}
            {wallet.expiresAt && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires {new Date(wallet.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {switching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          wallet.isActive && (
            <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </span>
          )
        )}

        {ownKey && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={event => event.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-60 group-hover:opacity-100"
                aria-label={`More actions for ${wallet.label}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={event => event.stopPropagation()}>
              <DropdownMenuItem disabled={testKey.isPending} onClick={test}>
                <Plug className="mr-2 h-3.5 w-3.5" />
                {testKey.isPending ? 'Testing…' : 'Test connection'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={askToRemove}>
                <Trash2 className="mr-2 h-3.5 w-3.5" />
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
