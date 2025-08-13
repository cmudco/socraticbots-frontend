import { create } from 'zustand';

import type { Bot } from '@/types/bot';

interface BotFormState {
  isOpen: boolean;
  isEdit: boolean;
  activeTab: string;
  isSubmitting: boolean;

  originalBot: Bot | null;

  title: string;
  subject: string;
  topic: string;
  greeting: string;
  chatPrompt: string;
  trackingPrompt: string;
  learningGoals: string;
  chatModelDareId: number | null;
  trackingModelDareId: number | null;
  accessCode: string;

  touched: Record<string, boolean>;
  errors: Record<string, string>;

  setActiveTab: (tab: string) => void;
  openForm: () => void;
  closeForm: () => void;
  initNewBot: () => void;
  initEditBot: (bot: Bot) => void;
  setSubmitting: (submitting: boolean) => void;
  updateField: (field: string, value: string) => void;
  updateModelField: (field: string, value: number | null) => void;
  updateAccessCode: (code: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  validateField: (field: string, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

const initialFormState = {
  originalBot: null,
  title: '',
  subject: '',
  topic: '',
  greeting: '',
  chatPrompt: '',
  trackingPrompt: '',
  learningGoals: '',
  chatModelDareId: null,
  trackingModelDareId: null,
  accessCode: '',
};

const initialValidationState = {
  touched: {},
  errors: {},
};

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

export const useBotFormStore = create<BotFormState>((set, get) => ({
  isOpen: false,
  isEdit: false,
  activeTab: 'basic',
  isSubmitting: false,
  ...initialFormState,
  ...initialValidationState,

  setActiveTab: (tab: string) => set({ activeTab: tab }),

  openForm: () => set({ isOpen: true }),

  closeForm: () =>
    set({
      isOpen: false,
      isEdit: false,
      isSubmitting: false,
      activeTab: 'basic',
      ...initialFormState,
      ...initialValidationState,
    }),

  initNewBot: () =>
    set({
      isEdit: false,
      isOpen: true,
      activeTab: 'basic',
      ...initialFormState,
      ...initialValidationState,
    }),

  initEditBot: (bot: Bot) =>
    set({
      isEdit: true,
      isOpen: true,
      activeTab: 'basic',
      originalBot: bot,
      title: bot.title || '',
      subject: bot.subject || '',
      topic: bot.topic || '',
      greeting: bot.prompts?.greeting || '',
      chatPrompt: bot.prompts?.chatPrompt || '',
      trackingPrompt: bot.prompts?.trackingPrompt || '',
      learningGoals: bot.prompts?.learningGoals || '',
      chatModelDareId: bot.modelPreference?.chatModelDareId || null,
      trackingModelDareId: bot.modelPreference?.trackingModelDareId || null,
      accessCode: bot.access_code?.code || '',
      ...initialValidationState,
    }),

  setSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

  updateField: (field: string, value: string) => {
    const error = validateFieldValue(field, value);
    set(state => ({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: error,
      },
    }));
  },

  updateModelField: (field: string, value: number | null) => {
    set({
      [field]: value,
    });
  },

  updateAccessCode: (code: string) => {
    set({ accessCode: code });
  },

  setFieldTouched: (field: string, touched: boolean) => {
    set(state => ({
      touched: {
        ...state.touched,
        [field]: touched,
      },
    }));
  },

  validateField: (field: string, value: string) => {
    const error = validateFieldValue(field, value);
    set(state => ({
      errors: {
        ...state.errors,
        [field]: error,
      },
    }));
  },

  validateForm: (): boolean => {
    const state = get();
    const newErrors: Record<string, string> = {};

    newErrors.title = validateFieldValue('title', state.title);
    newErrors.subject = validateFieldValue('subject', state.subject);
    newErrors.topic = validateFieldValue('topic', state.topic);

    set({ errors: newErrors });

    return !Object.values(newErrors).some(error => error !== '');
  },

  resetForm: () =>
    set({
      ...initialFormState,
      ...initialValidationState,
    }),
}));