import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { walletService } from '@/services/wallet.service';

import type { ActiveWalletType, NewLiteLLMKey, ProviderKeyProvider } from '@/types/wallet';

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
 * Wallet changes also change which models a bot form can offer, so every
 * mutation refreshes both the wallet list and the model pickers.
 */
const useInvalidateWallets = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    queryClient.invalidateQueries({ queryKey: ['dareLLMModels'] });
  };
};

export const useSetActiveWallet = () => {
  const invalidate = useInvalidateWallets();
  return useMutation({
    mutationFn: ({ type, refId }: { type: ActiveWalletType; refId: string | null }) =>
      walletService.setActiveWallet(type, refId),
    onSuccess: invalidate,
  });
};

export const useCreateLiteLLMKey = () => {
  const invalidate = useInvalidateWallets();
  return useMutation({
    mutationFn: (key: NewLiteLLMKey) => walletService.createLiteLLMKey(key),
    onSuccess: invalidate,
  });
};

export const useDeleteLiteLLMKey = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateWallets();
  return useMutation({
    mutationFn: (keyId: string) => walletService.deleteLiteLLMKey(keyId),
    onSuccess: () => {
      invalidate();
      // Bots using the key were turned off; their cards need the new state.
      queryClient.invalidateQueries({ queryKey: ['bots'] });
    },
  });
};

export const useTestLiteLLMConnection = () =>
  useMutation({
    mutationFn: ({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) =>
      walletService.testLiteLLMConnection(baseUrl, apiKey),
  });

export const useTestSavedLiteLLMKey = () =>
  useMutation({ mutationFn: (keyId: string) => walletService.testSavedLiteLLMKey(keyId) });

/** Bots that stop answering if the key is removed — fetched when the user asks to remove it. */
export const useLiteLLMKeyDependents = () =>
  useMutation({ mutationFn: (keyId: string) => walletService.getLiteLLMKeyDependents(keyId) });

export const useProviderKeyStatus = (enabled: boolean) => {
  return useQuery({
    queryKey: ['wallet', 'provider-keys'],
    queryFn: () => walletService.getProviderKeyStatus(),
    enabled,
  });
};

export const useSaveProviderKey = () => {
  const invalidate = useInvalidateWallets();
  return useMutation({
    mutationFn: ({ provider, apiKey }: { provider: ProviderKeyProvider; apiKey: string }) =>
      walletService.saveProviderKey(provider, apiKey),
    onSuccess: invalidate,
  });
};

export const useDeleteProviderKey = () => {
  const invalidate = useInvalidateWallets();
  return useMutation({
    mutationFn: (provider: ProviderKeyProvider) => walletService.deleteProviderKey(provider),
    onSuccess: invalidate,
  });
};

/** What a bot has cost so far — owner only. */
export const useBotUsage = (botId: number | undefined) => {
  return useQuery({
    queryKey: ['wallet', 'bot-usage', botId],
    queryFn: () => walletService.getBotUsage(botId as number),
    enabled: !!botId,
    staleTime: 30_000,
  });
};
