// src/store/thunks/chapterFormThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { modelsService } from '../../services/models.service';
import { setAvailableModels, setModelsLoading, setField } from '../slices/chapterFormSlice';

// Async thunk to fetch available models
export const fetchModels = createAsyncThunk(
  'chapterForm/fetchModels',
  async (_, { dispatch, getState }) => {
    try {
      dispatch(setModelsLoading(true));
      const models = await modelsService.getModels();
      dispatch(setAvailableModels(models));
      
      // Get current state
      const state = getState() as any;
      const isEdit = state.chapterForm.isEdit;
      const chatModelId = state.chapterForm.chat_model_id;
      const trackingModelId = state.chapterForm.tracking_model_id;
      
      // Set default models if not in edit mode and no models selected
      if (!isEdit && (!chatModelId || !trackingModelId)) {
        // Find Claude 3.7 Sonnet (Latest) for chat
        const defaultChatModel = models.find(model => 
          model.name.includes("Claude 3.7 Sonnet") && model.name.includes("Latest"));
        
        // Find Claude 3.7 Sonnet (Latest) for progress tracking
        const defaultProgressModel = models.find(model => 
          model.name.includes("Claude 3.7 Sonnet") && model.name.includes("Latest"));
        
        // Set defaults if found
        if (defaultChatModel && !chatModelId) {
          dispatch(setField({ field: 'chat_model_id', value: defaultChatModel.id }));
        }
        
        if (defaultProgressModel && !trackingModelId) {
          dispatch(setField({ field: 'tracking_model_id', value: defaultProgressModel.id }));
        }
      }
      
      return models;
    } catch (error) {
      console.error('Error loading models:', error);
      dispatch(setModelsLoading(false));
      throw error;
    }
  }
);
