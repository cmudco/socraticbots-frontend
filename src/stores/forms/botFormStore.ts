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
  isAdvanced: boolean;
  isActive: boolean;
  chatModelDareId: number | null;
  trackingModelDareId: number | null;
  webSearchEnabled: boolean;
  accessCode: string;
  accessCodeLimit: number;
  accessCodeUsed: number;
  isPubliclyDeployed: boolean;
  budget: string;
  budgetUsed: number;

  touched: Record<string, boolean>;
  errors: Record<string, string>;

  setActiveTab: (tab: string) => void;
  openForm: () => void;
  closeForm: () => void;
  initNewBot: () => void;
  initEditBot: (bot: Bot) => void;
  setSubmitting: (submitting: boolean) => void;
  updateField: (field: string, value: string) => void;
  setIsAdvanced: (value: boolean) => void;
  setIsActive: (value: boolean) => void;
  updateModelField: (field: string, value: number | null) => void;
  setWebSearchEnabled: (value: boolean) => void;
  updateAccessCode: (code: string) => void;
  updateAccessCodeLimit: (limit: number) => void;
  updateAccessCodeUsed: (used: number) => void;
  setIsPubliclyDeployed: (value: boolean) => void;
  updateBudget: (budget: string) => void;
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
  isAdvanced: false,
  isActive: true,
  chatModelDareId: null,
  trackingModelDareId: null,
  webSearchEnabled: false,
  accessCode: '',
  accessCodeLimit: 0,
  accessCodeUsed: 0,
  isPubliclyDeployed: false,
  budget: '',
  budgetUsed: 0,
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
      isAdvanced: !!bot.isAdvanced,
      isActive: bot.isActive !== undefined ? bot.isActive : true,
      chatModelDareId: bot.modelPreference?.chatModelDareId || null,
      trackingModelDareId: bot.modelPreference?.trackingModelDareId || null,
      webSearchEnabled: !!bot.webSearchEnabled,
      accessCode: bot.accessCode?.code || '',
      accessCodeLimit: bot.accessCode?.limit ?? 0,
      accessCodeUsed: bot.accessCode?.used ?? 0,
      isPubliclyDeployed: !!bot.isPubliclyDeployed,
      budget: bot.budget ? String(bot.budget) : '',
      budgetUsed: bot.budgetUsed ?? 0,
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

  setIsAdvanced: (value: boolean) => set({ isAdvanced: value }),

  setIsActive: (value: boolean) => set({ isActive: value }),

  updateModelField: (field: string, value: number | null) => {
    set({
      [field]: value,
    });
  },

  setWebSearchEnabled: (value: boolean) => set({ webSearchEnabled: value }),

  updateAccessCode: (code: string) => {
    set({ accessCode: code });
  },

  updateAccessCodeLimit: (limit: number) => {
    const normalized = Number.isFinite(limit) && limit >= 0 ? Math.floor(limit) : 0;
    set({ accessCodeLimit: normalized });
  },

  updateAccessCodeUsed: (used: number) => {
    const normalized = Number.isFinite(used) && used >= 0 ? Math.floor(used) : 0;
    set({ accessCodeUsed: normalized });
  },

  setIsPubliclyDeployed: (value: boolean) => set({ isPubliclyDeployed: value }),

  updateBudget: (budget: string) => {
    set({ budget });
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
