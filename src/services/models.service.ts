import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  description: string;
  static_model: boolean;
  max_tokens: number;
  input_price: number;
  output_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class ModelsService {
  async getModels(): Promise<AIModel[]> {
    return baseRequest<AIModel[]>({
      url: 'models/',
      method: METHOD.GET,
    });
  }

  async getModel(modelId: string): Promise<AIModel> {
    return baseRequest<AIModel>({
      url: `models/${modelId}/`,
      method: METHOD.GET,
    });
  }

  async getModelsByProvider(provider: string): Promise<AIModel[]> {
    try {
      const allModels = await this.getModels();
      return allModels.filter(
        model => model.provider.toLowerCase() === provider.toLowerCase() && model.is_active
      );
    } catch (error) {
      console.error(`Error fetching models for provider ${provider}:`, error);
      throw error;
    }
  }

  formatPrice(pricePerMillion: number): string {
    if (pricePerMillion >= 1) {
      return `$${pricePerMillion.toFixed(2)} per million tokens`;
    } else {
      const pricePerThousand = pricePerMillion / 1000;
      return `$${(pricePerThousand * 1000).toFixed(4)} per thousand tokens`;
    }
  }

  calculateCost(inputTokens: number, outputTokens: number, model: AIModel): number {
    const inputCost = (inputTokens / 1000000) * model.input_price;
    const outputCost = (outputTokens / 1000000) * model.output_price;
    return inputCost + outputCost;
  }
}

export const modelsService = new ModelsService();
