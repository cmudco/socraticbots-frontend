// src/services/chat.service.ts
import { api } from './api/instance';

export interface Chapter {
  id: string;
  title: string;
  subject?: string;
  topic?: string;
  created_at?: string;
  updated_at?: string;
}

class ChatService {
  // Fetch available chapters
  async getAvailableChapters(): Promise<Chapter[]> {
    try {
      const response = await api.get<Chapter[]>('/chat/available-chapters/');
      console.log('Fetched available chapters:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching available chapters:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const chatService = new ChatService();
