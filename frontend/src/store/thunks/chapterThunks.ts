// src/store/thunks/chapterThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { chapterService } from '../../services/chapters.service';
import { setSubmitting, closeForm, resetForm } from '../slices/chapterFormSlice';

export const createChapter = createAsyncThunk(
  'chapters/createChapter',
  async (
    { bookId }: { bookId: string }, 
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSubmitting(true));
      
      // Get form data from store
      const state = getState() as any;
      const { 
        title, subject, topic, 
        chat_model_id, tracking_model_id 
      } = state.chapterForm;

      const greeting = state.chapterForm.greeting;
      const chat_prompt = state.chapterForm.chat_prompt;
      const tracking_prompt = state.chapterForm.tracking_prompt;
      console.log("ON CREATE THE GREETING IS ", greeting);
      console.log("ON CREATE THE CHAT PROMPT IS ", chat_prompt);
      console.log("ON CREATE THE TRACKING PROMPT IS ", tracking_prompt);
      console.log(bookId);
      
      
      // Prepare request data
      const chapterData = {
        title,
        subject,
        topic
      };
      
      // Prepare model preferences if any are set
      const hasModelPreferences = !!chat_model_id || !!tracking_model_id;
      const modelPreferences = hasModelPreferences ? {
        chat_model_id,
        tracking_model_id
      } : undefined;
      
      // Call the service
      const newChapter = await chapterService.createChapter(
        bookId, 
        chapterData, 
        modelPreferences
      );
      
      // Clean up form state
      dispatch(closeForm());
      dispatch(resetForm());
      
      return newChapter;
    } catch (error: any) {
      console.error('Error creating chapter:', error);
      return rejectWithValue(error.message || 'Failed to create chapter');
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

export const updateChapter = createAsyncThunk(
  'chapters/updateChapter',
  async (
    { bookId, chapterId }: { bookId: string, chapterId: string }, 
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSubmitting(true));
      
      // Get form data from store
      const state = getState() as any;
      const { 
        title, subject, topic, 
        chat_model_id, tracking_model_id 
      } = state.chapterForm;

      const greeting = state.chapterForm.greeting;
      console.log("ON UPDATE THE GREETING IS ", greeting);
      const chat_prompt = state.chapterForm.chat_prompt;
      const tracking_prompt = state.chapterForm.tracking_prompt;
      console.log("ON UPDATE THE CHAT PROMPT IS ", chat_prompt);
      console.log("ON UPDATE THE TRACKING PROMPT IS ", tracking_prompt);
      
      
      
      // Prepare request data
      const chapterData = {
        title,
        subject,
        topic
      };
      
      // Prepare model preferences if any are set
      const hasModelPreferences = !!chat_model_id || !!tracking_model_id;
      const modelPreferences = hasModelPreferences ? {
        chat_model_id,
        tracking_model_id
      } : undefined;
      
      // Call the service
      const updatedChapter = await chapterService.updateChapter(
        bookId, 
        chapterId, 
        chapterData, 
        modelPreferences
      );
      
      // Clean up form state
      dispatch(closeForm());
      dispatch(resetForm());
      
      return updatedChapter;
    } catch (error: any) {
      console.error('Error updating chapter:', error);
      return rejectWithValue(error.message || 'Failed to update chapter');
    } finally {
      dispatch(setSubmitting(false));
    }
  }
);

export const deleteChapter = createAsyncThunk(
  'chapters/deleteChapter',
  async (
    { bookId, chapterId }: { bookId: string, chapterId: string },
    { rejectWithValue }
  ) => {
    try {
      await chapterService.deleteChapter(bookId, chapterId);
      return chapterId;
    } catch (error: any) {
      console.error('Error deleting chapter:', error);
      return rejectWithValue(error.message || 'Failed to delete chapter');
    }
  }
);

