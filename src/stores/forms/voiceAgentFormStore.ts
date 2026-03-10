import { create } from 'zustand';

import { AgentStatus, GrantAccessMode, SpellingPatience, TurnEagerness } from '@/types/voiceAgent';
import type { VoiceAgent } from '@/types/voiceAgent';

export interface VoiceAgentFormState {
  // Form mode
  isSubmitting: boolean;
  showAdvanced: boolean;

  // Basic fields
  name: string;
  description: string;
  status: AgentStatus;
  accessCode: string;
  team: number | null;

  // Exam fields
  examTitle: string;
  examInstructions: string;

  // AI Configuration
  systemPrompt: string;
  firstMessage: string;
  voiceId: string;
  temperature: number;
  maxDurationSeconds: number;

  // Advanced ElevenLabs Settings - Turn
  turnEagerness: TurnEagerness;
  turnTimeout: number;
  spellingPatience: SpellingPatience;

  // Advanced ElevenLabs Settings - TTS
  ttsStability: number;
  ttsSpeed: number;
  ttsSimilarityBoost: number;

  // Advanced ElevenLabs Settings - LLM
  llmModel: string;

  // Team member selection (used on create page, not persisted in getFormData)
  grantAccessMode: GrantAccessMode;
  selectedMemberUserIds: number[];

  // Validation
  touched: Record<string, boolean>;
  errors: Record<string, string>;

  // Actions
  setSubmitting: (submitting: boolean) => void;
  toggleAdvanced: () => void;
  setShowAdvanced: (show: boolean) => void;
  updateField: <K extends keyof VoiceAgentFormState>(
    field: K,
    value: VoiceAgentFormState[K]
  ) => void;
  updateNumericField: (field: string, value: number) => void;
  setGrantAccessMode: (mode: GrantAccessMode) => void;
  toggleMemberSelection: (userId: number) => void;
  setSelectedMemberUserIds: (userIds: number[]) => void;
  initNewAgent: () => void;
  initEditAgent: (agent: VoiceAgent) => void;
  resetForm: () => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  validateForm: () => boolean;
  getFormData: () => VoiceAgentFormData;
}

export interface VoiceAgentFormData {
  name: string;
  description: string;
  status: AgentStatus;
  accessCode?: string;
  team?: number | null;
  examTitle: string;
  examInstructions: string;
  systemPrompt: string;
  firstMessage: string;
  voiceId: string;
  temperature: number;
  maxDurationSeconds: number;
  conversationConfig?: {
    turn: {
      turnEagerness: TurnEagerness;
      turnTimeout: number;
      spellingPatience: SpellingPatience;
    };
    tts: {
      voiceId: string;
      stability: number;
      speed: number;
      similarityBoost: number;
    };
    agent: {
      prompt: {
        prompt: string;
        temperature: number;
        llm?: string;
      };
      firstMessage: string;
    };
    conversation: {
      maxDurationSeconds: number;
    };
  };
}

const initialFormState = {
  // Basic
  name: '',
  description: '',
  status: AgentStatus.Draft,
  accessCode: '',
  team: null as number | null,

  // Exam
  examTitle: '',
  examInstructions: '',

  // AI Config
  systemPrompt: '',
  firstMessage: '',
  voiceId: '',
  temperature: 0.7,
  maxDurationSeconds: 1800,

  // Advanced - Turn
  turnEagerness: TurnEagerness.Normal,
  turnTimeout: 7,
  spellingPatience: SpellingPatience.Auto,

  // Advanced - TTS
  ttsStability: 0.5,
  ttsSpeed: 1.0,
  ttsSimilarityBoost: 0.75,

  // Advanced - LLM
  llmModel: '',

  // Team member selection
  grantAccessMode: GrantAccessMode.EntireTeam,
  selectedMemberUserIds: [] as number[],
};

const initialValidationState = {
  touched: {} as Record<string, boolean>,
  errors: {} as Record<string, string>,
};

const validateFieldValue = (field: string, value: string): string => {
  switch (field) {
    case 'name':
      return !value.trim() ? 'Agent name is required' : '';
    case 'systemPrompt':
      return !value.trim() ? 'System prompt is required' : '';
    default:
      return '';
  }
};

export const useVoiceAgentFormStore = create<VoiceAgentFormState>((set, get) => ({
  isSubmitting: false,
  showAdvanced: false,
  ...initialFormState,
  ...initialValidationState,

  setSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

  toggleAdvanced: () => set(state => ({ showAdvanced: !state.showAdvanced })),

  setShowAdvanced: (show: boolean) => set({ showAdvanced: show }),

  updateField: (field, value) => {
    const error = typeof value === 'string' ? validateFieldValue(field as string, value) : '';
    set(state => ({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: error,
      },
    }));
  },

  updateNumericField: (field: string, value: number) => {
    set({ [field]: value });
  },

  setGrantAccessMode: (mode: GrantAccessMode) => set({ grantAccessMode: mode }),

  toggleMemberSelection: (userId: number) =>
    set(state => {
      const ids = state.selectedMemberUserIds;
      return {
        selectedMemberUserIds: ids.includes(userId)
          ? ids.filter(id => id !== userId)
          : [...ids, userId],
      };
    }),

  setSelectedMemberUserIds: (userIds: number[]) => set({ selectedMemberUserIds: userIds }),

  initNewAgent: () =>
    set({
      isSubmitting: false,
      showAdvanced: false,
      ...initialFormState,
      ...initialValidationState,
    }),

  initEditAgent: (agent: VoiceAgent) => {
    const config = agent.conversationConfig;
    set({
      isSubmitting: false,
      showAdvanced: !!config,

      // Basic
      name: agent.name || '',
      description: agent.description || '',
      status: agent.status || AgentStatus.Draft,
      accessCode: agent.accessCodeForAdmin || '',
      team: agent.team ?? null,

      // Exam
      examTitle: agent.examTitle || '',
      examInstructions: agent.examInstructions || '',

      // AI Config
      systemPrompt: agent.systemPrompt || '',
      firstMessage: agent.firstMessage || '',
      voiceId: agent.voiceId || '',
      temperature: agent.temperature ?? 0.7,
      maxDurationSeconds: agent.maxDurationSeconds ?? 1800,

      // Advanced - Turn
      turnEagerness: config?.turn?.turnEagerness ?? TurnEagerness.Normal,
      turnTimeout: config?.turn?.turnTimeout ?? 7,
      spellingPatience: config?.turn?.spellingPatience ?? SpellingPatience.Auto,

      // Advanced - TTS
      ttsStability: config?.tts?.stability ?? 0.5,
      ttsSpeed: config?.tts?.speed ?? 1.0,
      ttsSimilarityBoost: config?.tts?.similarityBoost ?? 0.75,

      // Advanced - LLM
      llmModel: config?.agent?.prompt?.llm ?? '',

      ...initialValidationState,
    });
  },

  resetForm: () =>
    set({
      isSubmitting: false,
      showAdvanced: false,
      ...initialFormState,
      ...initialValidationState,
    }),

  setFieldTouched: (field: string, touched: boolean) => {
    set(state => ({
      touched: {
        ...state.touched,
        [field]: touched,
      },
    }));
  },

  validateForm: (): boolean => {
    const state = get();
    const newErrors: Record<string, string> = {};

    newErrors.name = validateFieldValue('name', state.name);
    newErrors.systemPrompt = validateFieldValue('systemPrompt', state.systemPrompt);

    set({ errors: newErrors });

    return !Object.values(newErrors).some(error => error !== '');
  },

  getFormData: (): VoiceAgentFormData => {
    const state = get();

    const baseData: VoiceAgentFormData = {
      name: state.name,
      description: state.description,
      status: state.status,
      ...(state.accessCode.trim() && { accessCode: state.accessCode.trim() }),
      ...(state.team !== null && { team: state.team }),
      examTitle: state.examTitle,
      examInstructions: state.examInstructions,
      systemPrompt: state.systemPrompt,
      firstMessage: state.firstMessage,
      voiceId: state.voiceId,
      temperature: state.temperature,
      maxDurationSeconds: state.maxDurationSeconds,
    };

    // Only include conversationConfig if advanced settings are shown
    if (state.showAdvanced) {
      baseData.conversationConfig = {
        turn: {
          turnEagerness: state.turnEagerness,
          turnTimeout: state.turnTimeout,
          spellingPatience: state.spellingPatience,
        },
        tts: {
          voiceId: state.voiceId,
          stability: state.ttsStability,
          speed: state.ttsSpeed,
          similarityBoost: state.ttsSimilarityBoost,
        },
        agent: {
          prompt: {
            prompt: state.systemPrompt,
            temperature: state.temperature,
            ...(state.llmModel && { llm: state.llmModel }),
          },
          firstMessage: state.firstMessage,
        },
        conversation: {
          maxDurationSeconds: state.maxDurationSeconds,
        },
      };
    }

    return baseData;
  },
}));
