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

export interface ChatMessage {
  id: string;
  session_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

class ChatService {
  // Keep the existing chapter function since it works
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

  // Stream a message using the endpoint from your curl command
  streamMessage(message: string, callbacks: {
    onChunk: (content: string) => void;
    onComplete: () => void;
    onError: (error: any) => void;
  }): AbortController {
    const controller = new AbortController();
    let accumulatedContent = '';
    
    const streamWithApi = async () => {
      try {
        // This will use the axios instance that already has the auth interceptor
        const response = await api.post('/chat/stream-message/', 
          { message }, 
          { 
            responseType: 'text',
            signal: controller.signal,
            onDownloadProgress: (progressEvent) => {
              const text = progressEvent.event.target.responseText || '';
              
              // Process text chunks for SSE format
              const lines = text.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  try {
                    const dataContent = line.slice(5).trim();
                    if (dataContent) {
                      const jsonData = JSON.parse(dataContent);
                      if (jsonData.content !== undefined) {
                        // Append the new content to what we've already accumulated
                        accumulatedContent += jsonData.content;
                        callbacks.onChunk(accumulatedContent);
                      }
                    }
                  } catch (e) {
                    console.warn('Error parsing SSE data:', e);
                  }
                }
              }
            }
          }
        );
        
        callbacks.onComplete();
        return response;
        
      } catch (error) {
        // Don't report error if it's just an abort
        if (error instanceof Error && error.name !== 'CanceledError' && error.name !== 'AbortError') {
          console.error('Streaming error with API:', error);
          callbacks.onError(error);
        }
      }
    };

    streamWithApi();
    return controller;
  }
}

// Export a singleton instance
export const chatService = new ChatService();
