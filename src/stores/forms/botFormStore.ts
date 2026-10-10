import { create } from 'zustand';

import type { Bot } from '@/types/bot';

// Local type for quick prompt form state (without DB fields)
export interface QuickPromptFormItem {
  id?: number;
  title: string;
  prompt: string;
  order: number;
}

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
  // Opaque DARE picker id ("42" or "litellm:<key>:<name>"). See PickerModel.
  chatModelDareId: string | null;
  trackingModelDareId: string | null;
  webSearchEnabled: boolean;
  ragMode: 'naive' | 'advanced' | 'agentic';
  chatHistoryLimit: number;
  trackingHistoryLimit: number;
  accessCode: string;
  accessCodeLimit: number;
  accessCodeUsed: number;
  isPubliclyDeployed: boolean;
  budget: string;
  budgetUsed: string;

  // Theme fields
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  messageSpacing: 'compact' | 'normal' | 'relaxed';

  // Quick prompts
  quickPrompts: QuickPromptFormItem[];

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
  updateModelField: (field: string, value: string | null) => void;
  setWebSearchEnabled: (value: boolean) => void;
  setRagMode: (value: 'naive' | 'advanced' | 'agentic') => void;
  setHistoryLimit: (field: 'chatHistoryLimit' | 'trackingHistoryLimit', value: number) => void;
  updateAccessCode: (code: string) => void;
  updateAccessCodeLimit: (limit: number) => void;
  updateAccessCodeUsed: (used: number) => void;
  setIsPubliclyDeployed: (value: boolean) => void;
  updateBudget: (budget: string) => void;
  updateThemeField: (field: string, value: string) => void;
  // Quick prompts actions
  setQuickPrompts: (prompts: QuickPromptFormItem[]) => void;
  addQuickPrompt: () => void;
  updateQuickPrompt: (
    index: number,
    field: keyof QuickPromptFormItem,
    value: string | number
  ) => void;
  removeQuickPrompt: (index: number) => void;
  reorderQuickPrompts: (fromIndex: number, toIndex: number) => void;
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
  ragMode: 'advanced' as const,
  chatHistoryLimit: 0,
  trackingHistoryLimit: 0,
  accessCode: '',
  accessCodeLimit: 0,
  accessCodeUsed: 0,
  isPubliclyDeployed: false,
  budget: '',
  budgetUsed: '0',
  // Theme defaults
  primaryColor: '#8b5cf6',
  accentColor: '#a78bfa',
  backgroundColor: '#ffffff',
  foregroundColor: '#0f172a',
  fontFamily: 'sans' as const,
  fontSize: 'base' as const,
  borderRadius: 'md' as const,
  messageSpacing: 'normal' as const,
  // Quick prompts
  quickPrompts: [] as QuickPromptFormItem[],
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
      chatModelDareId: bot.modelPreference?.chatModelDareId ?? null,
      trackingModelDareId: bot.modelPreference?.trackingModelDareId ?? null,
      webSearchEnabled: !!bot.webSearchEnabled,
      ragMode: bot.ragMode || 'advanced',
      chatHistoryLimit: bot.chatHistoryLimit ?? 0,
      trackingHistoryLimit: bot.trackingHistoryLimit ?? 0,
      accessCode: bot.accessCode?.code || '',
      accessCodeLimit: bot.accessCode?.limit ?? 0,
      accessCodeUsed: bot.accessCode?.used ?? 0,
      isPubliclyDeployed: !!bot.isPubliclyDeployed,
      budget: bot.budget ? String(bot.budget) : '',
      budgetUsed: bot.budgetUsed ? String(bot.budgetUsed) : '0',
      // Theme fields
      primaryColor: bot.theme?.primaryColor || '#8b5cf6',
      accentColor: bot.theme?.accentColor || '#a78bfa',
      backgroundColor: bot.theme?.backgroundColor || '#ffffff',
      foregroundColor: bot.theme?.foregroundColor || '#0f172a',
      fontFamily: bot.theme?.fontFamily || 'sans',
      fontSize: bot.theme?.fontSize || 'base',
      borderRadius: bot.theme?.borderRadius || 'md',
      messageSpacing: bot.theme?.messageSpacing || 'normal',
      // Quick prompts
      quickPrompts: (bot.quickPrompts || []).map((qp, i) => ({
        id: qp.id,
        title: qp.title,
        prompt: qp.prompt,
        order: qp.order ?? i,
      })),
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

  updateModelField: (field: string, value: string | null) => {
    set({
      [field]: value,
    });
  },

  setWebSearchEnabled: (value: boolean) => set({ webSearchEnabled: value }),

  setRagMode: (value: 'naive' | 'advanced' | 'agentic') => set({ ragMode: value }),

  setHistoryLimit: (field: 'chatHistoryLimit' | 'trackingHistoryLimit', value: number) =>
    set({ [field]: value }),

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

  updateThemeField: (field: string, value: string) => {
    set({ [field]: value });
  },

  setQuickPrompts: (prompts: QuickPromptFormItem[]) => {
    set({ quickPrompts: prompts });
  },

  addQuickPrompt: () => {
    set(state => ({
      quickPrompts: [
        ...state.quickPrompts,
        { title: '', prompt: '', order: state.quickPrompts.length },
      ],
    }));
  },

  updateQuickPrompt: (index: number, field: keyof QuickPromptFormItem, value: string | number) => {
    set(state => {
      const newPrompts = [...state.quickPrompts];
      if (newPrompts[index]) {
        newPrompts[index] = { ...newPrompts[index], [field]: value };
      }
      return { quickPrompts: newPrompts };
    });
  },

  removeQuickPrompt: (index: number) => {
    set(state => ({
      quickPrompts: state.quickPrompts
        .filter((_, i) => i !== index)
        .map((qp, i) => ({ ...qp, order: i })),
    }));
  },

  reorderQuickPrompts: (fromIndex: number, toIndex: number) => {
    set(state => {
      const newPrompts = [...state.quickPrompts];
      const [removed] = newPrompts.splice(fromIndex, 1);
      newPrompts.splice(toIndex, 0, removed);
      return {
        quickPrompts: newPrompts.map((qp, i) => ({ ...qp, order: i })),
      };
    });
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
