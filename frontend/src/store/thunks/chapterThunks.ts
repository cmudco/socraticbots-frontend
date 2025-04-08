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
        chat_model_id, tracking_model_id,
        greeting, chat_prompt, tracking_prompt, learning_goals,
        learningGoals  // Keep old learning goals for comment-out code compatibility
      } = state.chapterForm;
      
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
      
      // Prepare prompt data if any are set - now including learning_goals
      const hasPromptData = !!greeting || !!chat_prompt || !!tracking_prompt || !!learning_goals;
      const promptData = hasPromptData ? {
        greeting,
        chat_prompt,
        tracking_prompt,
        learning_goals
      } : undefined;
      
      // Call the service with prompts data
      const newChapter = await chapterService.createChapter(
        bookId, 
        chapterData, 
        modelPreferences,
        promptData
      );
      
      /*
      // Save learning goals if they exist (keeping this for reference)
      if (learningGoals && learningGoals.length > 0) {
        for (const goal of learningGoals) {
          try {
            await chapterService.createLearningGoal(bookId, newChapter.id, {
              title: goal.title,
              order: goal.order
            });
          } catch (error) {
            console.error(`Error creating learning goal:`, error);
          }
        }
      }
      */
      
      // Fetch the updated chapter with the latest data
      const refreshedChapter = await chapterService.getChapter(bookId, newChapter.id);
      
      // Clean up form state
      dispatch(closeForm());
      dispatch(resetForm());
      
      return refreshedChapter;
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
        chat_model_id, tracking_model_id,
        greeting, chat_prompt, tracking_prompt, learning_goals,
        learningGoals // Keep old learning goals for comment-out code compatibility
      } = state.chapterForm;
      
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
      
      // Prepare prompt data if any are set - now including learning_goals
      const hasPromptData = !!greeting || !!chat_prompt || !!tracking_prompt || !!learning_goals;
      const promptData = hasPromptData ? {
        greeting,
        chat_prompt,
        tracking_prompt,
        learning_goals
      } : undefined;
      
      // Call the service with prompts data
      const updatedChapter = await chapterService.updateChapter(
        bookId, 
        chapterId,
        chapterData, 
        modelPreferences,
        promptData
      );

      /*
      // Save learning goals (keeping this for reference)
      if (learningGoals && learningGoals.length > 0) {
        // Process each goal in the current array - keep it simple
        for (const goal of learningGoals) {
          try {
            // Skip temp goals for now
            if (String(goal.id).startsWith('temp-')) {
              await chapterService.createLearningGoal(bookId, chapterId, {
                title: goal.title,
                order: goal.order
              });
            }
          } catch (error) {
            console.error(`Error saving learning goal:`, error);
          }
        }
      }
      */
      
      // Fetch the updated chapter with the latest data
      const refreshedChapter = await chapterService.getChapter(bookId, chapterId);
      
      // Clean up form state
      dispatch(closeForm());
      dispatch(resetForm());
      
      return refreshedChapter;
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

