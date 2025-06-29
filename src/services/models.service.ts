// src/services/models.service.ts
import { baseRequest } from '../utils/baseRequest';
import { METHOD } from '../constants/requests';

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
  // Get all available AI models
  async getModels(): Promise<AIModel[]> {
    return baseRequest<AIModel[]>({
      url: 'models/',
      method: METHOD.GET,
    });
  }
  
  // Get a single AI model by ID
  async getModel(modelId: string): Promise<AIModel> {
    return baseRequest<AIModel>({
      url: `models/${modelId}/`,
      method: METHOD.GET,
    });
  }

  // Get all models for a specific provider
  async getModelsByProvider(provider: string): Promise<AIModel[]> {
    try {
      const allModels = await this.getModels();
      return allModels.filter(model => 
        model.provider.toLowerCase() === provider.toLowerCase() && model.is_active
      );
    } catch (error) {
      console.error(`Error fetching models for provider ${provider}:`, error);
      throw error;
    }
  }

  // Format pricing for display
  formatPrice(pricePerMillion: number): string {
    if (pricePerMillion >= 1) {
      return `$${pricePerMillion.toFixed(2)} per million tokens`;
    } else {
      // Convert to dollars per thousand tokens for readability when price is small
      const pricePerThousand = pricePerMillion / 1000;
      return `$${(pricePerThousand * 1000).toFixed(4)} per thousand tokens`;
    }
  }

  // Calculate estimated cost for a given number of tokens
  calculateCost(inputTokens: number, outputTokens: number, model: AIModel): number {
    const inputCost = (inputTokens / 1000000) * model.input_price;
    const outputCost = (outputTokens / 1000000) * model.output_price;
    return inputCost + outputCost;
  }
}

// Export a singleton instance
export const modelsService = new ModelsService();
