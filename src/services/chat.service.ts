import { METHOD } from '@/constants/requests';
import { baseRequest } from '@/utils/baseRequest';
import type { Bot } from '@/types/bot';

// Interface for bot groups response from API
export interface BotGroup {
  id: number;
  title: string;
  description: string;
  botsCount: number;
  createdAt: string;
  updatedAt: string;
  bots: Bot[];
  collaborators: string[];
}

class ChatService {
  async getAvailableBots(): Promise<Bot[]> {
    // Get bot groups with complete bot objects
    const botGroups = await baseRequest<BotGroup[]>({
      url: 'bot-groups/',
      method: METHOD.GET,
    });
    
    // Flatten to get all available bots - no mapping needed, return complete objects!
    const availableBots: Bot[] = [];
    for (const group of botGroups) {
      if (group.bots) {
        availableBots.push(...group.bots);
      }
    }
    
    return availableBots;
  }
}

export const chatService = new ChatService();
