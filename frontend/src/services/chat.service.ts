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
  // Get chapters available for chat
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

  // Start a chat session with a specific chapter
  async startChatSession(chapterId: string): Promise<any> {
    try {
      const response = await api.post<any>('/chat/sessions/', { chapter_id: chapterId });
      return response.data;
    } catch (error) {
      console.error(`Error starting chat session for chapter ${chapterId}:`, error);
      throw error;
    }
  }

  // Send a message in a chat session
  async sendMessage(sessionId: string, message: string): Promise<any> {
    try {
      const response = await api.post<any>(`/chat/sessions/${sessionId}/messages/`, { 
        content: message 
      });
      return response.data;
    } catch (error) {
      console.error(`Error sending message in session ${sessionId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const chatService = new ChatService();
