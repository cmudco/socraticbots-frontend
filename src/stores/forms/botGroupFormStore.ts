import { create } from 'zustand';

import type { BotGroup } from '@/types/botGroup';

interface BotGroupFormState {
  isOpen: boolean;
  isEdit: boolean;
  activeTab: string;
  isSubmitting: boolean;

  originalBotGroup: BotGroup | null;

  title: string;
  description: string;
  accessCode: string;
  accessCodeLimit: number;
  accessCodeUsed: number;

  touched: Record<string, boolean>;
  errors: Record<string, string>;

  setActiveTab: (tab: string) => void;
  openForm: () => void;
  closeForm: () => void;
  initNewBotGroup: () => void;
  initEditBotGroup: (botGroup: BotGroup) => void;
  setSubmitting: (submitting: boolean) => void;
  updateField: (field: string, value: string) => void;
  updateAccessCode: (code: string) => void;
  updateAccessCodeLimit: (limit: number) => void;
  updateAccessCodeUsed: (used: number) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  validateField: (field: string, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

const initialFormState = {
  originalBotGroup: null,
  title: '',
  description: '',
  accessCode: '',
  accessCodeLimit: 0,
  accessCodeUsed: 0,
};

const initialValidationState = {
  touched: {},
  errors: {},
};

const validateFieldValue = (field: string, value: string): string => {
  switch (field) {
    case 'title':
      return !value.trim() ? 'Title is required' : '';
    case 'description':
      return !value.trim() ? 'Description is required' : '';
    default:
      return '';
  }
};

export const useBotGroupFormStore = create<BotGroupFormState>((set, get) => ({
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

  initNewBotGroup: () =>
    set({
      isEdit: false,
      isOpen: true,
      activeTab: 'basic',
      ...initialFormState,
      ...initialValidationState,
    }),

  initEditBotGroup: (botGroup: BotGroup) =>
    set({
      isEdit: true,
      isOpen: true,
      activeTab: 'basic',
      originalBotGroup: botGroup,
      title: botGroup.title || '',
      description: botGroup.description || '',
      accessCode: botGroup.accessCode?.code || '',
      accessCodeLimit: botGroup.accessCode?.limit ?? 0,
      accessCodeUsed: botGroup.accessCode?.used ?? 0,
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
    newErrors.description = validateFieldValue('description', state.description);

    set({ errors: newErrors });

    return !Object.values(newErrors).some(error => error !== '');
  },

  resetForm: () =>
    set({
      ...initialFormState,
      ...initialValidationState,
    }),
}));
