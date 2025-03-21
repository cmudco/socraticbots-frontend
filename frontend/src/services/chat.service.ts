// src/services/chat.service.ts
import { api } from './api/instance';

export interface Chapter {
  id: string;
  title: string;
  subject?: string;
  topic?: string;
  greeting?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user: string;
  chapter: string;
  chapter_details: Chapter;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
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

  async getConversationForChapter(chapterId: string): Promise<Conversation> {
    try {
      const response = await api.get<Conversation>(`/chat/conversations/for_chapter/${chapterId}/`);
      console.log('Fetched conversation for chapter:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching conversation for chapter ${chapterId}:`, error);
      throw error;
    }
  }

}

// Export a singleton instance
export const chatService = new ChatService();
