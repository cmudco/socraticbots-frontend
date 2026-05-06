import { useQuery } from '@tanstack/react-query';

import { walletService } from '@/services/wallet.service';

/**
 * Wallet header query — drives the always-visible WalletBadge in the top
 * navigation. 30s stale time keeps the badge near-real-time without hammering
 * DARE: each LLM debit takes a fraction of a second so users don't see a
 * stale balance for long, but normal page navigation reuses the cached value.
 */
export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet', 'list'],
    queryFn: () => walletService.getWallets(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

/**
 * SB-platform transaction history — drives the WalletDrawer's recent activity
 * section. Defaults to `platform=SocraticBots` so the drawer shows
 * SB-attributed debits; cross-platform users can override via a UI toggle
 * that flips this argument.
 */
export const useWalletTransactions = (
  platform: 'SocraticBots' | 'DARE' | 'ALL' = 'SocraticBots'
) => {
  return useQuery({
    queryKey: ['wallet', 'transactions', platform],
    queryFn: () => walletService.getTransactions({ platform }),
    staleTime: 15_000,
  });
};

/**
 * Resolved refill policy (USER → GROUP → SYSTEM) — used by the drawer to
 * show "next refill in 12 days" and the source badge.
 */
export const useEffectivePolicy = () => {
  return useQuery({
    queryKey: ['wallet', 'effective-policy'],
    queryFn: () => walletService.getEffectivePolicy(),
    staleTime: 5 * 60_000, // policy doesn't change minute-to-minute
  });
};

/**
 * Per-bot usage — owner-only. Disabled until both ids are present so
 * non-owner navigation doesn't trigger a 403.
 */
export const useBotUsage = (
  botId: number | null | undefined,
  options?: { groupBy?: 'user' | 'date'; period?: '7d' | '30d' | '90d' | 'all' }
) => {
  return useQuery({
    queryKey: ['wallet', 'bot-usage', botId, options?.groupBy, options?.period],
    queryFn: () =>
      walletService.getBotUsage(botId as number, {
        groupBy: options?.groupBy ?? 'user',
        period: options?.period ?? 'all',
      }),
    enabled: typeof botId === 'number' && botId > 0,
    staleTime: 30_000,
  });
};
