// src/store/slices/chapterFormSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AIModel } from '../../services/models.service';
import { Chapter, LearningGoal, SubGoal } from '../../services/chapters.service';
import { ChapterFile } from '../../services/files.service';

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
  learning_goals: string;

  //Learning Goals Tab
  learningGoals: LearningGoal[];
  
  // Models data
  availableModels: AIModel[];
  modelsLoading: boolean;

  // Files tab
  files: ChapterFile[];
  uploadProgress: Record<string, number>; // Track upload progress by tempId
  processingFiles: string[]; // Track files being processed
  fileErrors: Record<string, string>; // Track errors by fileId
  
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
  learning_goals: '',


  //Learning Goals Tab
  learningGoals: [],
  
  // Models data
  availableModels: [],
  modelsLoading: false,

  // Files tab
  files: [],
  uploadProgress: {},
  processingFiles: [],
  fileErrors: {},
  
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

    // Set all learning goals
    setLearningGoals: (state, action: PayloadAction<LearningGoal[]>) => {
      state.learningGoals = action.payload;
      state.isDirty = true;
    },

    // Add a single learning goal
    addLearningGoal: (state, action: PayloadAction<LearningGoal>) => {
      state.learningGoals.push(action.payload);
      state.isDirty = true;
    },

    // Update a learning goal
    updateLearningGoal: (state, action: PayloadAction<LearningGoal>) => {
      const index = state.learningGoals.findIndex(goal => goal.id === action.payload.id);
      if (index !== -1) {
        state.learningGoals[index] = action.payload;
        state.isDirty = true;
      }
    },

    // Remove a learning goal
    removeLearningGoal: (state, action: PayloadAction<string>) => {
      state.learningGoals = state.learningGoals.filter(goal => goal.id !== action.payload);
      state.isDirty = true;
    },

    // Reorder learning goals
    reorderLearningGoals: (state, action: PayloadAction<{ id: string; order: number }[]>) => {
      // Update the order property of each goal
      action.payload.forEach(item => {
        const goal = state.learningGoals.find(g => g.id === item.id);
        if (goal) {
          goal.order = item.order;
        }
      });
      
      // Sort the goals array based on the new order
      state.learningGoals.sort((a, b) => a.order - b.order);
      state.isDirty = true;
    },

    // Add a subgoal to a learning goal
    addSubGoal: (state, action: PayloadAction<{learningGoalId: string, subgoal: SubGoal}>) => {
      const { learningGoalId, subgoal } = action.payload;
      const learningGoal = state.learningGoals.find(lg => lg.id === learningGoalId);
      if (learningGoal) {
        if (!learningGoal.subgoals) {
          learningGoal.subgoals = [];
        }
        learningGoal.subgoals.push(subgoal);
        state.isDirty = true;
      }
    },

    // Remove a subgoal from a learning goal
    removeSubGoal: (state, action: PayloadAction<{learningGoalId: string, subgoalId: string}>) => {
      const { learningGoalId, subgoalId } = action.payload;
      const learningGoal = state.learningGoals.find(lg => lg.id === learningGoalId);
      if (learningGoal && learningGoal.subgoals) {
        learningGoal.subgoals = learningGoal.subgoals.filter(sg => sg.id !== subgoalId);
        state.isDirty = true;
      }
    },
    
    // Update a subgoal
    updateSubGoal: (state, action: PayloadAction<{
      learningGoalId: string, 
      subgoalId: string, 
      updates: Partial<{title: string, order: number}>
    }>) => {
      const { learningGoalId, subgoalId, updates } = action.payload;
      const learningGoal = state.learningGoals.find(lg => lg.id === learningGoalId);
      if (learningGoal && learningGoal.subgoals) {
        const subgoal = learningGoal.subgoals.find(sg => sg.id === subgoalId);
        if (subgoal) {
          Object.assign(subgoal, updates);
          state.isDirty = true;
        }
      }
    },

    // Set all files
    setFiles: (state, action: PayloadAction<ChapterFile[]>) => {
      state.files = action.payload;
    },

    // Add a new file
    addFile: (state, action: PayloadAction<ChapterFile>) => {
      state.files.push(action.payload);
    },

    // Remove a file
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(file => file.id !== action.payload);
    },

    // Update upload progress
    setUploadProgress: (state, action: PayloadAction<{ fileId: string; progress: number }>) => {
      state.uploadProgress[action.payload.fileId] = action.payload.progress;
    },

    // Clear upload progress
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },

    // Set processing status
    setFileProcessing: (state, action: PayloadAction<string>) => {
      state.processingFiles.push(action.payload);
    },

    // Clear processing status
    clearFileProcessing: (state, action: PayloadAction<string>) => {
      state.processingFiles = state.processingFiles.filter(id => id !== action.payload);
    },

    // Set file error
    setFileError: (state, action: PayloadAction<{ fileId: string; error: string }>) => {
      state.fileErrors[action.payload.fileId] = action.payload.error;
    },

    // Clear file error
    clearFileError: (state, action: PayloadAction<string>) => {
      delete state.fileErrors[action.payload];
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
      state.learning_goals = '';

      // Clear learning goals
      state.learningGoals = [];

      // Clear file-related state
      state.files = [];
      state.uploadProgress = {};
      state.processingFiles = [];
      state.fileErrors = {};

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
        state.learning_goals = chapter.prompts.learning_goals || '';
      } else {
        state.greeting = '';
        state.chat_prompt = '';
        state.tracking_prompt = '';
        state.learning_goals = '';
      }

      // Set learning goals if they exist
      if (chapter.learning_goals && Array.isArray(chapter.learning_goals)) {
        // Just assign directly since the types match
        state.learningGoals = chapter.learning_goals;
      } else {
        state.learningGoals = [];
      }

      // Initialize file-related state
      if (chapter.files && Array.isArray(chapter.files)) {
        state.files = chapter.files;
      } else {
        state.files = [];
      }
      state.uploadProgress = {};
      state.processingFiles = [];
      state.fileErrors = {};

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
      if (false) {console.log(state);}
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
  resetForm,
  setLearningGoals,
  addLearningGoal,
  updateLearningGoal,
  removeLearningGoal,
  reorderLearningGoals,
  addSubGoal,
  removeSubGoal,
  updateSubGoal,
  setFiles,
  addFile,
  removeFile,
  setUploadProgress,
  clearUploadProgress,
  setFileProcessing,
  clearFileProcessing,
  setFileError,
  clearFileError
} = chapterFormSlice.actions;

export default chapterFormSlice.reducer;
