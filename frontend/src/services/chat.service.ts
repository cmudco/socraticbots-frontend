// src/services/chat.service.ts
import { api } from './api/instance';
import { authService } from './auth.service';
import { AuthTokens } from '../types/auth';

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


interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
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
      return response.data;
    } catch (error) {
      console.error('Error fetching available chapters:', error);
      throw error;
    }
  }

  async getConversationForChapter(chapterId: string): Promise<Conversation> {
    try {
      const response = await api.get<Conversation>(`/chat/conversations/for_chapter/${chapterId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching conversation for chapter ${chapterId}:`, error);
      throw error;
    }
  }

  async sendMessage(conversationId: string, message: string): Promise<any> {
    try {
      const response = await api.post('/chat/send-message/', {
        conversation_id: conversationId,
        message: message
      });
      
      console.log('Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  private async getFreshToken(): Promise<string> {
    try {
      // Get stored tokens
      const storedTokens = localStorage.getItem('auth_tokens');
      if (!storedTokens) throw new Error('No auth tokens found');
      
      // Parse tokens
      const tokens: AuthTokens = JSON.parse(storedTokens);
      
      // Force a token refresh
      const newTokens = await authService.refreshToken(tokens.refresh);
      
      // Save new tokens
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      
      return newTokens.access;
    } catch (error) {
      console.error('Error getting fresh token:', error);
      throw error;
    }
  }

  async streamMessage(
    conversationId: string, 
    message: string,
    callbacks: StreamCallbacks
  ): Promise<string> {
    try {
      const token = await this.getFreshToken();
      if (!token) throw new Error('No auth token available');

      const response = await fetch(`https://api.socraticbooks.com/api/chat/send-message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: message
        })
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      callbacks.onStart?.();

      let fullResponse = '';
      
      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        
        const lines = chunk.split('\n');

        // Process each line
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.content) {
                fullResponse += data.content;
                callbacks.onToken?.(data.content);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          } else if (line.startsWith('event: end')) {
            callbacks.onComplete?.();
          }
        }
      }

      return fullResponse;

    } catch (error) {
      console.error('Error in streamMessage:', error);
      callbacks.onError?.(error);
      throw error;
    }
  }

  async streamTrackingProgress(
    conversationId: string,
    callbacks: StreamCallbacks
  ): Promise<string> {
    try {
      const token = await this.getFreshToken();
      
      const response = await fetch(`${api.defaults.baseURL}/chat/track-progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: conversationId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      callbacks.onStart?.();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.content) {
                fullResponse += data.content;
                callbacks.onToken?.(data.content);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          } else if (line.startsWith('event: end')) {
            callbacks.onComplete?.();
          }
        }
      }

      return fullResponse;

    } catch (error) {
      console.error('Error in streamTrackingProgress:', error);
      callbacks.onError?.(error);
      throw error;
    }
  }

  async getLatestProgress(conversationId: string): Promise<{content: string | null, created_at: string | null}> {
    try {
      const response = await api.get(`/chat/latest-progress/${conversationId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest progress:', error);
      throw error;
    }
  }

}

// Export a singleton instance
export const chatService = new ChatService();
