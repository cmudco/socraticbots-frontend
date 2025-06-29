// src/stores/chapterFormStore.ts
import { create } from 'zustand';
import type { Chapter, } from '../services/chapters.service';

interface ChapterFormState {
  // Modal state
  isOpen: boolean;
  isEdit: boolean;
  activeTab: string;
  isSubmitting: boolean;

  // Original chapter data (for edit mode)
  originalChapter: Chapter | null;

  // Form data
  title: string;
  subject: string;
  topic: string;
  greeting: string;
  chat_prompt: string;
  tracking_prompt: string;
  learning_goals: string;
  chat_model_id: string;
  tracking_model_id: string;

  // Form validation state
  touched: Record<string, boolean>;
  errors: Record<string, string>;

  // Actions
  setActiveTab: (tab: string) => void;
  openForm: () => void;
  closeForm: () => void;
  initNewChapter: () => void;
  initEditChapter: (chapter: Chapter) => void;
  setSubmitting: (submitting: boolean) => void;
  updateField: (field: string, value: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  validateField: (field: string, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

const initialFormState = {
  originalChapter: null,
  title: '',
  subject: '',
  topic: '',
  greeting: '',
  chat_prompt: '',
  tracking_prompt: '',
  learning_goals: '',
  chat_model_id: '',
  tracking_model_id: '',
};

const initialValidationState = {
  touched: {},
  errors: {},
};

// Simple validation rules
const validateFieldValue = (field: string, value: string): string => {
  switch (field) {
    case 'title':
      return !value.trim() ? 'Title is required' : '';
    case 'subject':
      return !value.trim() ? 'Subject is required' : '';
    case 'topic':
      return !value.trim() ? 'Topic is required' : '';
    default:
      return '';
  }
};

export const useChapterFormStore = create<ChapterFormState>((set, get) => ({
  // Initial state
  isOpen: false,
  isEdit: false,
  activeTab: 'basic',
  isSubmitting: false,
  ...initialFormState,
  ...initialValidationState,

  // Actions
  setActiveTab: (tab: string) => set({ activeTab: tab }),

  openForm: () => set({ isOpen: true }),

  closeForm: () => set({
    isOpen: false,
    isEdit: false,
    isSubmitting: false,
    activeTab: 'basic',
    ...initialFormState,
    ...initialValidationState
  }),

  initNewChapter: () => set({
    isEdit: false,
    isOpen: true,
    activeTab: 'basic',
    ...initialFormState,
    ...initialValidationState
  }),

  initEditChapter: (chapter: Chapter) => set({
    isEdit: true,
    isOpen: true,
    activeTab: 'basic',
    originalChapter: chapter,
    title: chapter.title || '',
    subject: chapter.subject || '',
    topic: chapter.topic || '',
    greeting: chapter.prompts?.greeting || '',
    chat_prompt: chapter.prompts?.chat_prompt || '',
    tracking_prompt: chapter.prompts?.tracking_prompt || '',
    learning_goals: chapter.prompts?.learning_goals || '',
    chat_model_id: chapter.model_preference?.chat_model?.id || '',
    tracking_model_id: chapter.model_preference?.tracking_model?.id || '',
    ...initialValidationState
  }),

  setSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

  updateField: (field: string, value: string) => {
    const error = validateFieldValue(field, value);
    set(state => ({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: error
      }
    }));
  },

  setFieldTouched: (field: string, touched: boolean) => {
    set(state => ({
      touched: {
        ...state.touched,
        [field]: touched
      }
    }));
  },

  validateField: (field: string, value: string) => {
    const error = validateFieldValue(field, value);
    set(state => ({
      errors: {
        ...state.errors,
        [field]: error
      }
    }));
  },

  validateForm: (): boolean => {
    const state = get();
    const newErrors: Record<string, string> = {};

    // Validate required fields
    newErrors.title = validateFieldValue('title', state.title);
    newErrors.subject = validateFieldValue('subject', state.subject);
    newErrors.topic = validateFieldValue('topic', state.topic);

    set({ errors: newErrors });

    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== '');
  },

  resetForm: () => set({
    ...initialFormState,
    ...initialValidationState
  }),
}));
