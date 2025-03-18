// src/store/slices/chapterFormSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AIModel } from '../../services/models.service';
import { Chapter } from '../../services/chapters.service';

// Define the state structure for the chapter form
interface ChapterFormState {
  // Basic Info tab
  title: string;
  subject: string;
  topic: string;
  chat_model_id?: string;
  tracking_model_id?: string;
  
  // UI State
  activeTab: 'basic' | 'prompts' | 'goals' | 'files' | 'deployment';
  isOpen: boolean;
  isEdit: boolean;
  originalChapter: Chapter | null;

  // Prompts tab 
  greeting: string;
  chat_prompt: string;
  tracking_prompt: string;
  
  // Models data
  availableModels: AIModel[];
  modelsLoading: boolean;
  
  // Form state
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

const initialState: ChapterFormState = {
  // Basic Info tab
  title: '',
  subject: '',
  topic: '',
  chat_model_id: undefined,
  tracking_model_id: undefined,
  
  // UI State
  activeTab: 'basic',
  isOpen: false,
  isEdit: false,
  originalChapter: null,

  // Prompts tab 
  greeting: '',
  chat_prompt: '',
  tracking_prompt: '',
  
  // Models data
  availableModels: [],
  modelsLoading: false,
  
  // Form state
  isDirty: false,
  isSubmitting: false,
  errors: {}
};

const chapterFormSlice = createSlice({
  name: 'chapterForm',
  initialState,
  reducers: {
    // Set a single form field
    setField: (state, action: PayloadAction<{ field: string; value: string }>) => {
      const { field, value } = action.payload;
      
      // Type assertion to make TypeScript happy with dynamic property access
      (state as any)[field] = value;
      
      // Mark form as dirty when fields change
      state.isDirty = true;
    },
    
    // Change the active tab
    setActiveTab: (state, action: PayloadAction<ChapterFormState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    
    // Set available models
    setAvailableModels: (state, action: PayloadAction<AIModel[]>) => {
      state.availableModels = action.payload;
      state.modelsLoading = false;
    },
    
    // Set models loading state
    setModelsLoading: (state, action: PayloadAction<boolean>) => {
      state.modelsLoading = action.payload;
    },
    
    // Initialize form for creating a new chapter
    initNewChapter: (state) => {
      // Reset to initial values for a new chapter
      state.title = '';
      state.subject = '';
      state.topic = '';
      state.chat_model_id = undefined;
      state.tracking_model_id = undefined;

      // Clear prompts
      state.greeting = '';
      state.chat_prompt = '';
      state.tracking_prompt = '';

      state.isEdit = false;
      state.originalChapter = null;
      state.isDirty = false;
      state.errors = {};
      state.activeTab = 'basic';
      state.isOpen = true;
    },
    
    // Initialize form for editing an existing chapter
    initEditChapter: (state, action: PayloadAction<Chapter>) => {
      const chapter = action.payload;
      
      // Fill form with chapter data
      state.title = chapter.title;
      state.subject = chapter.subject;
      state.topic = chapter.topic;
      
      // Set model preferences if they exist
      if (chapter.model_preference) {
        state.chat_model_id = chapter.model_preference.chat_model?.id;
        state.tracking_model_id = chapter.model_preference.tracking_model?.id;
      } else {
        state.chat_model_id = undefined;
        state.tracking_model_id = undefined;
      }

      // Set prompts if they exist - this part was outside the function
      if (chapter.prompts) {
        state.greeting = chapter.prompts.greeting || '';
        state.chat_prompt = chapter.prompts.chat_prompt || '';
        state.tracking_prompt = chapter.prompts.tracking_prompt || '';
      } else {
        state.greeting = '';
        state.chat_prompt = '';
        state.tracking_prompt = '';
      }

      state.isEdit = true;
      state.originalChapter = chapter;
      state.isDirty = false;
      state.errors = {};
      state.activeTab = 'basic';
      state.isOpen = true;
    },
    
    
    // Close the form
    closeForm: (state) => {
      state.isOpen = false;
    },
    
    // Start form submission
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    
    // Set form validation errors
    setErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.errors = action.payload;
    },
    
    // Clear all form data and state
    resetForm: (state) => {
      return initialState;
    }
  }
});

export const {
  setField,
  setActiveTab,
  setAvailableModels,
  setModelsLoading,
  initNewChapter,
  initEditChapter,
  closeForm,
  setSubmitting,
  setErrors,
  resetForm
} = chapterFormSlice.actions;

export default chapterFormSlice.reducer;
