import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import { Bot, CreateBotRequest, UpdateBotRequest } from '@/types/bot';

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
    botData: CreateBotRequest & {
      chatModelDareId?: string | null;
      trackingModelDareId?: string | null;
      greeting?: string;
      chatPrompt?: string;
      trackingPrompt?: string;
      learningGoals?: string;
      isAdvanced?: boolean;
      maxContextSnippets?: number;
      documentSimilarityThreshold?: number;
    }
  ): Promise<Bot> {
    try {
      const newBot = await baseRequest<Bot>({
        url: `bot-groups/${botGroupId}/bots/`,
        method: METHOD.POST,
        data: botData,
      });

      // If we have nested data, refetch to get the complete bot with relationships
      const hasNestedData =
        botData.chatModelDareId ||
        botData.trackingModelDareId ||
        botData.greeting ||
        botData.chatPrompt ||
        botData.trackingPrompt ||
        botData.learningGoals ||
        botData.maxContextSnippets !== undefined ||
        botData.documentSimilarityThreshold !== undefined;

      if (hasNestedData) {
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
    botData: UpdateBotRequest & {
      chatModelDareId?: string | null;
      trackingModelDareId?: string | null;
      greeting?: string;
      chatPrompt?: string;
      trackingPrompt?: string;
      learningGoals?: string;
      isAdvanced?: boolean;
      maxContextSnippets?: number;
      documentSimilarityThreshold?: number;
    }
  ): Promise<Bot> {
    try {
      const updatedBot = await baseRequest<Bot>({
        url: `bot-groups/${botGroupId}/bots/${botId}/`,
        method: METHOD.PATCH,
        data: botData,
      });

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

  async cloneBot(botGroupId: number, botId: number): Promise<Bot> {
    return baseRequest<Bot>({
      url: `bot-groups/${botGroupId}/bots/${botId}/clone/`,
      method: METHOD.POST,
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
}

export const botService = new BotService();
