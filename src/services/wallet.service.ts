import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import {
  BotUsageResponse,
  EffectivePolicy,
  TransactionsResponse,
  WalletsResponse,
} from '@/types/wallet';

class WalletService {
  /**
   * Active wallet + visible-wallet list.
   * Pure pass-through to DARE `/api/billing/wallets/`.
   */
  async getWallets(): Promise<WalletsResponse> {
    return baseRequest<WalletsResponse>({
      url: 'wallet/',
      method: METHOD.GET,
    });
  }

  /**
   * Caller's transactions, defaulted to the SocraticBooks platform.
   * Use `platform=ALL` to include cross-platform activity.
   */
  async getTransactions(params?: {
    platform?: 'SocraticBots' | 'DARE' | 'ALL';
    billingMode?: 'wallet' | 'own_api';
  }): Promise<TransactionsResponse> {
    return baseRequest<TransactionsResponse>({
      url: 'wallet/transactions/',
      method: METHOD.GET,
      params: {
        platform: params?.platform ?? 'SocraticBots',
        ...(params?.billingMode ? { billing_mode: params.billingMode } : {}),
      },
    });
  }

  async getEffectivePolicy(): Promise<EffectivePolicy> {
    return baseRequest<EffectivePolicy>({
      url: 'wallet/effective-policy/',
      method: METHOD.GET,
    });
  }

  /**
   * Per-bot usage breakdown — owner-only on the DARE side.
   * Returns an aggregate `totals` block plus a `breakdown` array
   * grouped by user (default) or date.
   */
  async getBotUsage(
    botId: number,
    options?: { groupBy?: 'user' | 'date'; period?: '7d' | '30d' | '90d' | 'all' }
  ): Promise<BotUsageResponse> {
    return baseRequest<BotUsageResponse>({
      url: `wallet/bots/${botId}/usage/`,
      method: METHOD.GET,
      params: {
        group_by: options?.groupBy ?? 'user',
        period: options?.period ?? 'all',
      },
    });
  }
}

export const walletService = new WalletService();
