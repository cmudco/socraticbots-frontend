// src/services/chat.service.ts
import { api } from './api/instance';
import { authService } from './auth.service';
import { AuthTokens } from '../types/auth';
import config from '../lib/config';
import type { Conversation, ChatMessage } from '@/types/chat';

export interface Chapter {
  id: string;
  title: string;
  subject?: string;
  topic?: string;
  greeting?: string;
  created_at?: string;
  updated_at?: string;
}

interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (completeMessage?: any) => void;
  onError?: (error: unknown) => void;
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

  async sendMessage(conversationId: string, message: string): Promise<ChatMessage> {
    try {
      const response = await api.post<ChatMessage>('/chat/send-message/', {
        conversation_id: conversationId,
        message: message
      });
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

      const response = await fetch(`${config.apiUrl}/chat/send-message/`, {
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
      console.log('[streamMessage] onStart');

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
                console.log('[streamMessage] onToken', data.content);
                callbacks.onToken?.(data.content);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          } else if (line.startsWith('event: complete')) {
            console.log('[streamMessage] onComplete');
            // Try to parse the complete message data if available
            try {
              const completeData = line.replace('event: complete', '').trim();
              if (completeData) {
                const completeMessage = JSON.parse(completeData);
                callbacks.onComplete?.(completeMessage);
              } else {
                callbacks.onComplete?.();
              }
            } catch (e) {
              console.log('[streamMessage] No complete message data, calling onComplete without data');
              callbacks.onComplete?.();
            }
          } else if (line.startsWith('event: end')) {
            console.log('[streamMessage] stream ended');
            // Stream has ended, but we don't need to do anything special here
          }
        }
      }

      return fullResponse;

    } catch (error) {
      console.error('Error in streamMessage:', error);
      callbacks.onError?.(error);
      console.log('[streamMessage] onError', error);
      throw error;
    }
  }

  async streamTrackingProgress(
    conversationId: string,
    callbacks: StreamCallbacks
  ): Promise<string> {
    try {
      const token = await this.getFreshToken();

      const response = await fetch(`${config.apiUrl}/chat/track-progress/`, {
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
          } else if (line.startsWith('event: complete')) {
            callbacks.onComplete?.();
          } else if (line.startsWith('event: end')) {
            // Stream has ended
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

  // Trigger progress tracking after message completion
  async triggerProgressTracking(conversationId: string, callbacks?: StreamCallbacks): Promise<void> {
    try {
      // This will trigger the progress tracking stream with real-time updates
      await this.streamTrackingProgress(conversationId, {
        onStart: () => {
          callbacks?.onStart?.();
          console.log('[ProgressTracking] Started');
        },
        onToken: (token) => {
          callbacks?.onToken?.(token);
          console.log('[ProgressTracking] Token:', token);
        },
        onComplete: () => {
          callbacks?.onComplete?.();
          console.log('[ProgressTracking] Completed');
        },
        onError: (error) => {
          callbacks?.onError?.(error);
          console.error('[ProgressTracking] Error:', error);
        },
      });
    } catch (error) {
      console.error('Error triggering progress tracking:', error);
      callbacks?.onError?.(error);
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

  async clearConversation(conversationId: string): Promise<Conversation> {
    try {
      const response = await api.post<Conversation>(`/chat/clear-conversation/${conversationId}/`);
      return response.data;
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw error;
    }
  }

}

// Export a singleton instance
export const chatService = new ChatService();
