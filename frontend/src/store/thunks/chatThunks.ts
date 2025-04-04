// src/store/thunks/chatThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { chatService, ChatMessage } from '../../services/chat.service';
import { 
  setLoading, 
  setAvailableChapters,
  setError,
  setConversation,
  setConversationLoading,
  setConversationError,
  addPendingUserMessage,
  clearPendingUserMessage,
  startStreaming,
  updateStreamingMessage,
  completeStreaming,
  setStreamingError,
  setTrackingError,
  setTrackingResult,
  startTracking,
  setClearingConversation,
  clearTrackingResult,
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

export const fetchConversationForChapter = createAsyncThunk(
  'chat/fetchConversationForChapter',
  async (chapterId: string, { dispatch }) => {
    try {
      dispatch(setConversationLoading(true));
      dispatch(setConversationError(null));
      
      // First get the conversation
      const conversation = await chatService.getConversationForChapter(chapterId);
      dispatch(setConversation(conversation));
      
      // Then fetch latest progress
      try {
        const progress = await chatService.getLatestProgress(conversation.id);
        if (progress.content) {
          dispatch(setTrackingResult(progress.content));
        }
      } catch (error) {
        console.error('Error fetching initial progress:', error);
        // Don't fail the whole operation if progress fetch fails
      }
      
      return conversation;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      dispatch(setConversationError('Failed to load conversation'));
      throw error;
    } finally {
      dispatch(setConversationLoading(false));
    }
  }
);

export const clearConversation = createAsyncThunk(
  'chat/clearConversation',
  async (conversationId: string, { dispatch }) => {
    try {
      dispatch(setClearingConversation(true));
      // Call the service to clear the conversation
      const newConversation = await chatService.clearConversation(conversationId);
      // Update the Redux state with the new conversation
      dispatch(setConversation(newConversation));
      // Clear the tracking result as well
      dispatch(clearTrackingResult());
    } catch (error) {
      console.error('Error clearing conversation:', error);
      dispatch(setConversationError('Failed to clear conversation'));
    } finally {
      dispatch(setClearingConversation(false));
    }
  }
);

export const trackConversationProgress = createAsyncThunk(
  'chat/trackProgress',
  async (conversationId: string, { dispatch }) => {
    try {
      // Start tracking state
      dispatch(startTracking());

      // Use the streaming version of tracking
      const fullResponse = await chatService.streamTrackingProgress(
        conversationId,
        {
          onStart: () => {
            if (false) console.log('Tracking stream started');
          },
          onToken: (token) => {
            // Update the tracking result progressively
            dispatch(setTrackingResult(token));
          },
          onComplete: () => {
            if (false) console.log('Tracking stream completed');
          },
          onError: (error) => {
            console.error('Tracking stream error:', error);
            dispatch(setTrackingError(error.message || 'Failed to track progress'));
          }
        }
      );

      return fullResponse;

    } catch (error: any) {
      console.error('Error in trackConversationProgress:', error);
      dispatch(setTrackingError(error.message || 'Failed to track progress'));
      return null;
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message }: { conversationId: string, message: string }, 
         { dispatch, getState }) => {
    try {
      // Add the pending user message immediately to show in UI
      dispatch(addPendingUserMessage(message));
      
      // Send the message to get the assistant's response
      const assistantMessage = await chatService.sendMessage(conversationId, message);
      
      // Get the current state
      const state = getState() as any;
      
      // If we have a conversation, update it with both the user and assistant messages
      if (state.chat.conversation) {
        // Create a user message object
        const userMessage: ChatMessage = {
          id: 'user-' + Date.now(),
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        };
        
        // Create a copy of the current conversation with both messages added
        const updatedConversation = {
          ...state.chat.conversation,
          messages: [
            ...state.chat.conversation.messages,
            userMessage,        // Add the user message
            assistantMessage    // Add the assistant message
          ]
        };
        
        // Update the conversation with the new messages
        dispatch(setConversation(updatedConversation));
      }
      
      // Clear the pending message now that we've added the real one
      dispatch(clearPendingUserMessage());
      
      return assistantMessage;
    } catch (error: any) {
      return error.message || 'Failed to send message';
    }
  }
);

export const sendStreamingMessage = createAsyncThunk(
  'chat/sendStreamingMessage',
  async ({ conversationId, message }: { conversationId: string, message: string }, 
         { dispatch, getState }) => {
    try {
      
      // Add the pending user message immediately
      dispatch(addPendingUserMessage(message));
      
      // Get current state
      const state = getState() as any;
      
      // If we have a conversation, add the user message
      if (state.chat.conversation) {
        const userMessage: ChatMessage = {
          id: 'user-' + Date.now(),
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        };
        
        // Update conversation with user message
        const updatedConversation = {
          ...state.chat.conversation,
          messages: [...state.chat.conversation.messages, userMessage]
        };
        dispatch(setConversation(updatedConversation));
      }

      // Start streaming
      dispatch(startStreaming());

      // Use the streaming service with callbacks
      const fullResponse = await chatService.streamMessage(
        conversationId,
        message,
        {
          onStart: () => {
            if (false) console.log('Stream started - onStart callback');
          },
          onToken: (token) => {
            dispatch(updateStreamingMessage(token));
          },
          onComplete: async () => {
            
            dispatch(completeStreaming());
            dispatch(clearPendingUserMessage());
            
            
            // Clear previous tracking and start new tracking
            dispatch(startTracking());

            // Start tracking progress after message completion
            try {
              dispatch(trackConversationProgress(conversationId));
            } catch (error) {
              console.error('Error starting tracking:', error);
            }
          },
          onError: (error) => {
            console.error('Streaming error:', error);
            dispatch(setStreamingError(error.message || 'Streaming failed'));
          }
        }
      );

      return fullResponse;
      
    } catch (error: any) {
      console.error('Error in sendStreamingMessage:', error);
      dispatch(setStreamingError(error.message || 'Failed to send streaming message'));
      return null;
    }
  }
);

