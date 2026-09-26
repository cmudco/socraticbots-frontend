import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import {
  ActiveWalletType,
  BotUsageResponse,
  EffectivePolicy,
  LiteLLMKeyDependents,
  LiteLLMTestResponse,
  NewLiteLLMKey,
  ProviderKeyProvider,
  ProviderKeyStatusMap,
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

  async setActiveWallet(type: ActiveWalletType, refId: string | null): Promise<void> {
    await baseRequest({ url: 'wallet/active/', method: METHOD.PUT, data: { type, refId } });
  }

  async testLiteLLMConnection(baseUrl: string, apiKey: string): Promise<LiteLLMTestResponse> {
    return baseRequest<LiteLLMTestResponse>({
      url: 'wallet/litellm/test/',
      method: METHOD.POST,
      data: { baseUrl, apiKey },
    });
  }

  async testSavedLiteLLMKey(keyId: string): Promise<LiteLLMTestResponse> {
    return baseRequest<LiteLLMTestResponse>({
      url: `wallet/litellm/${keyId}/test/`,
      method: METHOD.POST,
    });
  }

  async createLiteLLMKey(key: NewLiteLLMKey): Promise<void> {
    await baseRequest({ url: 'wallet/litellm/', method: METHOD.POST, data: key });
  }

  async getLiteLLMKeyDependents(keyId: string): Promise<LiteLLMKeyDependents> {
    return baseRequest<LiteLLMKeyDependents>({
      url: `wallet/litellm/${keyId}/dependents/`,
      method: METHOD.GET,
    });
  }

  async deleteLiteLLMKey(keyId: string): Promise<void> {
    await baseRequest({ url: `wallet/litellm/${keyId}/`, method: METHOD.DELETE });
  }

  async getProviderKeyStatus(): Promise<ProviderKeyStatusMap> {
    return baseRequest<ProviderKeyStatusMap>({
      url: 'wallet/provider-keys/status/',
      method: METHOD.GET,
    });
  }

  async saveProviderKey(provider: ProviderKeyProvider, apiKey: string): Promise<void> {
    await baseRequest({
      url: 'wallet/provider-keys/',
      method: METHOD.POST,
      data: { provider, apiKey },
    });
  }

  async deleteProviderKey(provider: ProviderKeyProvider): Promise<void> {
    await baseRequest({ url: `wallet/provider-keys/${provider}/`, method: METHOD.DELETE });
  }

  async getBotUsage(botId: number): Promise<BotUsageResponse> {
    return baseRequest<BotUsageResponse>({
      url: `wallet/bots/${botId}/usage/`,
      method: METHOD.GET,
    });
  }
}

export const walletService = new WalletService();
