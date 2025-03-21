// src/services/chat.service.ts
import { api } from './api/instance';

export interface Chapter {
  id: string;
  title: string;
  subject: string;
  topic: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user: number;
  chapter: number;
  chapter_details: Chapter;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface MessageResponse {
  user_message: Message;
  assistant_message: Message;
}

class ChatService {
  // Get available chapters
  async getAvailableChapters(): Promise<Chapter[]> {
    try {
      const response = await api.get<Chapter[]>('/chat/available-chapters/');
      return response.data;
    } catch (error) {
      console.error('Error fetching available chapters:', error);
      throw error;
    }
  }

  // Get or create a conversation for a chapter
  async getOrCreateConversation(chapterId: string): Promise<Conversation> {
    try {
      const response = await api.get<Conversation>(`/chat/conversations/for_chapter/${chapterId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error getting conversation for chapter ${chapterId}:`, error);
      throw error;
    }
  }

  // Send a message (non-streaming)
  async sendMessage(conversationId: string, message: string): Promise<MessageResponse> {
    try {
      const response = await api.post<MessageResponse>('/chat/send-message/', {
        conversation_id: conversationId,
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Stream a message response
  streamMessage(
    message: string, 
    onChunk: (content: string) => void,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void,
    conversationId?: string
  ): () => void {
    // Create the URL and request options for the EventSource
    const url = new URL('/api/chat/stream-message/', window.location.origin);
    
    // Get the current access token from wherever it's stored
    const token = localStorage.getItem('access_token'); // or from your auth state management
    
    // Create payload with proper type annotation
    const payload: Record<string, string> = {
      message: message
    };
    
    // Add conversation_id if it exists
    if (conversationId) {
      payload.conversation_id = conversationId;
    }
    
    // Create headers and configure fetch
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const fetchController = new AbortController();
    const signal = fetchController.signal;
    
    // Immediately invoke an async function
    (async () => {
      try {
        // Notify that streaming is starting
        if (onStart) onStart();
        
        const response = await fetch('/api/chat/stream-message/', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
          signal: signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Ensure response.body exists
        const body = response.body;
        if (!body) {
          throw new Error('Response body is null');
        }
        
        // Get the reader from the response body stream
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Streaming is complete
            if (onEnd) onEnd();
            break;
          }
          
          // Decode the chunk and add to buffer
          const text = decoder.decode(value, { stream: true });
          buffer += text;
          
          // Process complete SSE events from buffer
          let eventEnd = buffer.indexOf('\n\n');
          while (eventEnd > -1) {
            const eventStr = buffer.substring(0, eventEnd);
            buffer = buffer.substring(eventEnd + 2);
            
            // Process the event
            const eventLines = eventStr.split('\n');
            let eventType = 'message';
            let eventData = '';
            
            for (const line of eventLines) {
              if (line.startsWith('event:')) {
                eventType = line.substring(6).trim();
              }
              else if (line.startsWith('data:')) {
                eventData = line.substring(5).trim();
              }
            }
            
            // Handle different event types
            if (eventType === 'start') {
              // Already called onStart
            } else if (eventType === 'error') {
              try {
                if (eventData) {
                  const errorData = JSON.parse(eventData);
                  if (onError) onError(errorData.error || 'Streaming error');
                } else {
                  if (onError) onError('Unknown streaming error');
                }
              } catch (e) {
                if (onError) onError('Error parsing error message');
              }
            } else if (eventType === 'end') {
              if (onEnd) onEnd();
              return; // Exit on end
            } else if (eventData) {
              // Regular message chunk
              try {
                const data = JSON.parse(eventData);
                if (data && typeof data === 'object' && 'content' in data) {
                  onChunk(data.content as string);
                }
              } catch (e) {
                console.error('Error parsing message data:', e);
              }
            }
            
            eventEnd = buffer.indexOf('\n\n');
          }
        }
      } catch (error: unknown) {
        console.error('Error in stream:', error);
        // Handle unknown error type safely
        if (onError) {
          if (error instanceof Error) {
            onError(error.message);
          } else {
            onError('Error streaming message');
          }
        }
      }
    })();
    
    // Return a function to abort the fetch
    return () => {
      fetchController.abort();
    };
  }
  
  // Save a complete message after streaming (for future use)
  async saveStreamedMessage(conversationId: string, userMessage: string, assistantMessage: string): Promise<void> {
    // In the future, you might want to implement this to save streamed messages to the database
    // For now, we'll handle it by just displaying the messages in the UI
    console.log('Would save streamed message to database here');
  }
}

// Export a singleton instance
export const chatService = new ChatService();
