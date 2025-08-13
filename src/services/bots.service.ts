import { METHOD } from '@/constants/requests';
import { baseRequest } from '@/utils/baseRequest';
import {
  Bot,
  CreateBotRequest,
  UpdateBotRequest,
  BotModelPreferenceRequest,
  BotPromptRequest,
  BotModelPreference,
  BotPrompt,
  BotAccessCode
} from '@/types/bot';

class BotService {
  async getBots(botGroupId: number): Promise<Bot[]> {
    return baseRequest<Bot[]>({
      url: `bot-groups/${botGroupId}/bots/`,
      method: METHOD.GET,
    });
  }

  async getBot(botGroupId: number, botId: number): Promise<Bot> {
    return baseRequest<Bot>({
      url: `bot-groups/${botGroupId}/bots/${botId}/`,
      method: METHOD.GET,
    });
  }

  async createBot(
    botGroupId: number,
    botData: CreateBotRequest,
    modelPreferences?: BotModelPreferenceRequest,
    promptData?: BotPromptRequest
  ): Promise<Bot> {
    try {
      const newBot = await baseRequest<Bot>({
        url: `bot-groups/${botGroupId}/bots/`,
        method: METHOD.POST,
        data: botData,
      });

      let needsRefetch = false;

      if (
        modelPreferences &&
        (modelPreferences.chatModelDareId || modelPreferences.trackingModelDareId)
      ) {
        await this.setBotModelPreferences(botGroupId, newBot.id, modelPreferences);
        needsRefetch = true;
      }

      if (
        promptData &&
        (promptData.greeting || promptData.chatPrompt || promptData.trackingPrompt)
      ) {
        await this.setBotPrompts(botGroupId, newBot.id, promptData);
        needsRefetch = true;
      }

      if (needsRefetch) {
        return await this.getBot(botGroupId, newBot.id);
      }

      return newBot;
    } catch (error) {
      console.error('Error creating bot:', error);
      throw error;
    }
  }

  async updateBot(
    botGroupId: number,
    botId: number,
    botData: UpdateBotRequest,
    modelPreferences?: BotModelPreferenceRequest,
    promptData?: BotPromptRequest
  ): Promise<Bot> {
    try {
      const updatedBot = await baseRequest<Bot>({
        url: `bot-groups/${botGroupId}/bots/${botId}/`,
        method: METHOD.PATCH,
        data: botData,
      });

      let needsRefetch = false;

      if (
        modelPreferences &&
        (modelPreferences.chatModelDareId || modelPreferences.trackingModelDareId)
      ) {
        await this.setBotModelPreferences(botGroupId, botId, modelPreferences);
        needsRefetch = true;
      }

      if (
        promptData &&
        (promptData.greeting || promptData.chatPrompt || promptData.trackingPrompt)
      ) {
        await this.setBotPrompts(botGroupId, botId, promptData);
        needsRefetch = true;
      }

      if (needsRefetch) {
        return await this.getBot(botGroupId, botId);
      }

      return updatedBot;
    } catch (error) {
      console.error(`Error updating bot ${botId}:`, error);
      throw error;
    }
  }

  async deleteBot(botGroupId: number, botId: number): Promise<void> {
    await baseRequest<void>({
      url: `bot-groups/${botGroupId}/bots/${botId}/`,
      method: METHOD.DELETE,
    });
  }

  async setBotModelPreferences(
    botGroupId: number,
    botId: number,
    preferences: BotModelPreferenceRequest
  ): Promise<BotModelPreference> {
    return baseRequest<BotModelPreference>({
      url: `bot-groups/${botGroupId}/bots/${botId}/model_preference/`,
      method: METHOD.POST,
      data: preferences,
    });
  }

  async getBotModelPreferences(botGroupId: number, botId: number): Promise<BotModelPreference> {
    return baseRequest<BotModelPreference>({
      url: `bot-groups/${botGroupId}/bots/${botId}/model_preference/`,
      method: METHOD.GET,
    });
  }

  async getBotPrompts(botGroupId: number, botId: number): Promise<BotPrompt> {
    return baseRequest<BotPrompt>({
      url: `bot-groups/${botGroupId}/bots/${botId}/prompts/`,
      method: METHOD.GET,
    });
  }

  async setBotPrompts(
    botGroupId: number,
    botId: number,
    promptData: BotPromptRequest
  ): Promise<BotPrompt> {
    return baseRequest<BotPrompt>({
      url: `bot-groups/${botGroupId}/bots/${botId}/prompts/`,
      method: METHOD.POST,
      data: promptData,
    });
  }

  async attachFiles(botGroupId: number, botId: number, fileIds: number[]): Promise<void> {
    return baseRequest<void>({
      url: `bot-groups/${botGroupId}/bots/${botId}/attach_files/`,
      method: METHOD.POST,
      data: { file_ids: fileIds },
    });
  }

  async detachFiles(botGroupId: number, botId: number, fileIds: number[]): Promise<void> {
    return baseRequest<void>({
      url: `bot-groups/${botGroupId}/bots/${botId}/detach_files/`,
      method: METHOD.POST,
      data: { file_ids: fileIds },
    });
  }

  async getBotAccessCode(botGroupId: number, botId: number): Promise<BotAccessCode | null> {
    try {
      const response = await baseRequest<{ code: string; created_at: string; created_by: string }>({
        url: `access-codes/bot-groups/${botGroupId}/bots/${botId}/`,
        method: METHOD.GET,
      });
      
      if (!response.code) {
        return null;
      }
      
      return {
        code: response.code,
        created_at: response.created_at || '',
        created_by: response.created_by || ''
      };
    } catch (error) {
      // Return null if access code doesn't exist
      return null;
    }
  }

  async generateBotAccessCode(botGroupId: number, botId: number, customCode?: string): Promise<BotAccessCode> {
    const response = await baseRequest<{ code: string; created_at: string; created_by: string }>({
      url: `access-codes/bot-groups/${botGroupId}/bots/${botId}/generate/`,
      method: METHOD.POST,
      data: customCode ? { code: customCode } : {},
    });
    
    return {
      code: response.code,
      created_at: response.created_at,
      created_by: response.created_by
    };
  }

  async deleteBotAccessCode(botGroupId: number, botId: number): Promise<void> {
    await baseRequest<void>({
      url: `access-codes/bot-groups/${botGroupId}/bots/${botId}/delete/`,
      method: METHOD.DELETE,
    });
  }
}

export const botService = new BotService();