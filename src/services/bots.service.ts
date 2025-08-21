import { METHOD } from '@/constants/requests';
import { baseRequest } from '@/utils/baseRequest';
import {
  Bot,
  CreateBotRequest,
  UpdateBotRequest
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
    botData: CreateBotRequest & {
      chatModelDareId?: number;
      trackingModelDareId?: number;
      greeting?: string;
      chatPrompt?: string;
      trackingPrompt?: string;
      learningGoals?: string;
    }
  ): Promise<Bot> {
    try {
      // Transform frontend field names to backend field names
      const requestData = {
        ...botData,
        // Access code handling
        ...(botData.accessCode !== undefined && { access_code: botData.accessCode }),
        // Model preferences inline
        ...(botData.chatModelDareId !== undefined && { chat_model_dare_id: botData.chatModelDareId }),
        ...(botData.trackingModelDareId !== undefined && { tracking_model_dare_id: botData.trackingModelDareId }),
        // Prompts inline (already have correct names)
        ...(botData.greeting !== undefined && { greeting: botData.greeting }),
        ...(botData.chatPrompt !== undefined && { chat_prompt: botData.chatPrompt }),
        ...(botData.trackingPrompt !== undefined && { tracking_prompt: botData.trackingPrompt }),
        ...(botData.learningGoals !== undefined && { learning_goals: botData.learningGoals }),
      };

      const newBot = await baseRequest<Bot>({
        url: `bot-groups/${botGroupId}/bots/`,
        method: METHOD.POST,
        data: requestData,
      });

      // If we have nested data, refetch to get the complete bot with relationships
      const hasNestedData = botData.chatModelDareId || botData.trackingModelDareId || 
                           botData.greeting || botData.chatPrompt || 
                           botData.trackingPrompt || botData.learningGoals;
      
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
      chatModelDareId?: number;
      trackingModelDareId?: number;
      greeting?: string;
      chatPrompt?: string;
      trackingPrompt?: string;
      learningGoals?: string;
    }
  ): Promise<Bot> {
    try {
      // Transform frontend field names to backend field names
      const requestData = {
        ...botData,
        // Access code handling
        ...(botData.accessCode !== undefined && { access_code: botData.accessCode }),
        // Model preferences inline
        ...(botData.chatModelDareId !== undefined && { chat_model_dare_id: botData.chatModelDareId }),
        ...(botData.trackingModelDareId !== undefined && { tracking_model_dare_id: botData.trackingModelDareId }),
        // Prompts inline (already have correct names)
        ...(botData.greeting !== undefined && { greeting: botData.greeting }),
        ...(botData.chatPrompt !== undefined && { chat_prompt: botData.chatPrompt }),
        ...(botData.trackingPrompt !== undefined && { tracking_prompt: botData.trackingPrompt }),
        ...(botData.learningGoals !== undefined && { learning_goals: botData.learningGoals }),
      };

      const updatedBot = await baseRequest<Bot>({
        url: `bot-groups/${botGroupId}/bots/${botId}/`,
        method: METHOD.PATCH,
        data: requestData,
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