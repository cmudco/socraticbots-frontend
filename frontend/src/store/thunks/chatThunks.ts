// src/store/thunks/chatThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { chatService, ChatMessage } from '../../services/chat.service';
import { 
  setLoading, 
  setAvailableChapters, 
  addMessage, 
  updateLastMessage,
  setStreaming,
  setError
} from '../slices/chatSlice';

// Async thunk to fetch available chapters
export const fetchAvailableChapters = createAsyncThunk(
  'chat/fetchAvailableChapters',
  async (_, { dispatch, getState }) => {
    try {
      // Check if API is ready
      const state = getState() as any;
      const isApiReady = state.api?.isReady;

      if (!isApiReady) {
        console.log('API not ready yet, skipping fetch');
        return [];
      }

      // Set loading state to true
      dispatch(setLoading(true));
      
      // Fetch chapters from the API
      const chapters = await chatService.getAvailableChapters();
      
      // Update the state with fetched chapters
      dispatch(setAvailableChapters(chapters));
      
      return chapters;
    } catch (error: unknown) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chapters';
      console.error('Error in fetchAvailableChapters:', errorMessage);
      dispatch(setError(errorMessage));
      
      // Return empty array to avoid unhandled rejection
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Async thunk to send a message with streaming response
export const sendStreamingMessage = createAsyncThunk(
  'chat/sendStreamingMessage',
  async (
    { message }: { message: string },
    { dispatch }
  ) => {
    let abortController: AbortController | null = null;
    
    try {
      // Add the user message to the state
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      };
      dispatch(addMessage(userMessage));
      
      // Add a temporary message for the assistant's response
      const tempAssistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      };
      dispatch(addMessage(tempAssistantMessage));
      
      // Set streaming indicator
      dispatch(setStreaming(true));
      
      // Send the message with streaming
      abortController = chatService.streamMessage(
        message,
        {
          onChunk: (content) => {
            dispatch(updateLastMessage(content));
          },
          onComplete: () => {
            dispatch(setStreaming(false));
          },
          onError: (error) => {
            dispatch(setStreaming(false));
            dispatch(setError(typeof error === 'string' ? error : error.message || 'Error streaming message'));
          }
        }
      );
      
      return { success: true };
    } catch (error: unknown) {
      // Abort the streaming request if needed
      if (abortController) {
        abortController.abort();
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Error in sendStreamingMessage:', errorMessage);
      dispatch(setError(errorMessage));
      dispatch(setStreaming(false));
      return { success: false, error: errorMessage };
    }
  }
);
