import { METHOD } from '@/constants/requests';
import { baseRequest } from '@/utils/baseRequest';

export interface DareLLMModel {
  id: number;
  name: string;
  identifier: string;
  provider: string;
  description?: string;
  isReasoning: boolean;
  inputTokenRatePerMillion: string;
  outputTokenRatePerMillion: string;
}

class DareLLMModelsService {
  async getDareLLMModels(): Promise<DareLLMModel[]> {
    return baseRequest<DareLLMModel[]>({
      url: 'models/dare-llms/',
      method: METHOD.GET,
    });
  }

  async getDareLLMModel(id: number): Promise<DareLLMModel> {
    return baseRequest<DareLLMModel>({
      url: `models/dare-llms/${id}/`,
      method: METHOD.GET,
    });
  }

  async searchDareLLMModels(query: string): Promise<DareLLMModel[]> {
    return baseRequest<DareLLMModel[]>({
      url: 'models/dare-llms/',
      method: METHOD.GET,
      params: { search: query },
    });
  }

  async getDareLLMModelsByProvider(provider: string): Promise<DareLLMModel[]> {
    return baseRequest<DareLLMModel[]>({
      url: 'models/dare-llms/',
      method: METHOD.GET,
      params: { provider },
    });
  }
}

export const dareLLMModelsService = new DareLLMModelsService();