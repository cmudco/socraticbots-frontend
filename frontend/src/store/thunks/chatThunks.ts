// src/store/thunks/chatThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/chat.service';
import { 
  setLoading, 
  setAvailableChapters,
  setError,
    setConversation,
    setConversationLoading,
    setConversationError
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
        
        const conversation = await chatService.getConversationForChapter(chapterId);
        dispatch(setConversation(conversation));
        
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

export const sendChatMessage = createAsyncThunk(
    'chat/sendMessage',
    async ({ conversationId, message }: { conversationId: string, message: string }, 
            { dispatch, rejectWithValue, getState }) => {
        try {
        // Get the current chapter ID from state
        const state = getState() as { chat: { selectedChapterId: string } };
        const chapterId = state.chat.selectedChapterId;
        
        // Send the message through the service
        const response = await chatService.sendMessage(conversationId, message);
        
        // Refresh the conversation to get the updated messages
        if (chapterId) {
            dispatch(fetchConversationForChapter(chapterId));
        }
        
        return response;
        } catch (error: any) { // Add the `: any` type annotation
        // Now you can safely access error.message
        return rejectWithValue(error.message || 'Failed to send message');
        }
    }
);