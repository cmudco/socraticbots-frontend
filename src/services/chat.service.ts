import { METHOD } from '@/constants/requests';

import config from '@/lib/config';

import { baseRequest } from '@/utils/baseRequest';

import type { ChatMessage, Conversation } from '@/types/chat';

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
  onComplete?: (completeMessage?: ChatMessage) => void;
  onError?: (error: Error) => void;
}

class ChatService {
  async getAvailableChapters(): Promise<Chapter[]> {
    return baseRequest<Chapter[]>({
      url: 'chat/available-chapters/',
      method: METHOD.GET,
    });
  }

  async getConversationForChapter(chapterId: string): Promise<Conversation> {
    return baseRequest<Conversation>({
      url: `chat/conversations/for_chapter/${chapterId}/`,
      method: METHOD.GET,
    });
  }

  async sendMessage(conversationId: string, message: string): Promise<ChatMessage> {
    return baseRequest<ChatMessage>({
      url: 'chat/send-message/',
      method: METHOD.POST,
      data: {
        conversation_id: conversationId,
        message: message,
      },
    });
  }

  private getCurrentToken(): string | null {
    return localStorage.getItem('access_token');
  }

  async streamMessage(
    conversationId: string,
    message: string,
    callbacks: StreamCallbacks
  ): Promise<string> {
    try {
      const token = this.getCurrentToken();
      if (!token) throw new Error('No auth token available');

      const response = await fetch(`${config.apiUrl}/chat/send-message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: message,
        }),
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
        if (done) {
          break;
        }

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
            try {
              const completeData = line.replace('event: complete', '').trim();
              if (completeData) {
                const completeMessage = JSON.parse(completeData);
                callbacks.onComplete?.(completeMessage);
              } else {
                callbacks.onComplete?.();
              }
            } catch {
              callbacks.onComplete?.();
            }
          } else if (line.startsWith('event: end')) {
            // Stream ended
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Error in streamMessage:', error);
      callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async streamTrackingProgress(
    conversationId: string,
    callbacks: StreamCallbacks
  ): Promise<string> {
    try {
      const token = this.getCurrentToken();
      if (!token) throw new Error('No auth token available');

      const response = await fetch(`${config.apiUrl}/chat/track-progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
        }),
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
            // Stream ended
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Error in streamTrackingProgress:', error);
      callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async triggerProgressTracking(
    conversationId: string,
    callbacks?: StreamCallbacks
  ): Promise<void> {
    try {
      await this.streamTrackingProgress(conversationId, {
        onStart: () => {
          callbacks?.onStart?.();
        },
        onToken: token => {
          callbacks?.onToken?.(token);
        },
        onComplete: () => {
          callbacks?.onComplete?.();
        },
        onError: error => {
          callbacks?.onError?.(error);
          console.error('[ProgressTracking] Error:', error);
        },
      });
    } catch (error) {
      console.error('Error triggering progress tracking:', error);
      callbacks?.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getLatestProgress(
    conversationId: string
  ): Promise<{ content: string | null; created_at: string | null }> {
    return baseRequest<{ content: string | null; created_at: string | null }>({
      url: `chat/latest-progress/${conversationId}/`,
      method: METHOD.GET,
    });
  }

  async clearConversation(conversationId: string): Promise<Conversation> {
    return baseRequest<Conversation>({
      url: `chat/clear-conversation/${conversationId}/`,
      method: METHOD.POST,
    });
  }
}

export const chatService = new ChatService();
