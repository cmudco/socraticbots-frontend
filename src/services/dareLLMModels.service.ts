import { METHOD } from '@/constants/requests';
import { WalletEmptyReason, WalletScopedType } from '@/constants/wallet';

import { baseRequest } from '@/utils/baseRequest';

export interface DareLLMModel {
  id: number | string;
  name: string;
  identifier: string;
  provider: string;
  description?: string;
  isReasoning: boolean;
  inputTokenRatePerMillion: string | null;
  outputTokenRatePerMillion: string | null;
  tier: string | null;
  isSynthetic?: boolean;
}

export interface WalletMeta {
  type: WalletScopedType;
  providers: string[];
  isEmpty: boolean;
  emptyReason: WalletEmptyReason | null;
  staleProbe: boolean;
}

export interface WalletScopedModelsResponse {
  models: DareLLMModel[];
  wallet: WalletMeta;
}

class DareLLMModelsService {
  async getDareLLMModels(): Promise<DareLLMModel[]> {
    return baseRequest<DareLLMModel[]>({
      url: 'bots/dare-llms/',
      method: METHOD.GET,
    });
  }

  async getWalletScopedDareLLMModels(walletScope: string): Promise<WalletScopedModelsResponse> {
    return baseRequest<WalletScopedModelsResponse>({
      url: 'bots/dare-llms/',
      method: METHOD.GET,
      params: { wallet_scope: walletScope },
    });
  }

  async getDareLLMModel(id: number): Promise<DareLLMModel> {
    return baseRequest<DareLLMModel>({
      url: `bots/dare-llms/${id}/`,
      method: METHOD.GET,
    });
  }

  async searchDareLLMModels(query: string): Promise<DareLLMModel[]> {
    return baseRequest<DareLLMModel[]>({
      url: 'bots/dare-llms/',
      method: METHOD.GET,
      params: { search: query },
    });
  }

  async getDareLLMModelsByProvider(provider: string): Promise<DareLLMModel[]> {
    return baseRequest<DareLLMModel[]>({
      url: 'bots/dare-llms/',
      method: METHOD.GET,
      params: { provider },
    });
  }
}

export const dareLLMModelsService = new DareLLMModelsService();
