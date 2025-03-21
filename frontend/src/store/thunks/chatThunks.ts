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
