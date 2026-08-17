export interface BotModelPreference {
  id: number;
  // Opaque DARE picker id — see PickerModel in dareLLMModels.service.
  chatModelDareId?: string | null;
  trackingModelDareId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BotPrompt {
  id: number;
  greeting: string;
  chatPrompt: string;
  trackingPrompt: string;
  learningGoals: string;
  createdAt: string;
  updatedAt: string;
}

export interface BotAccessCode {
  code: string;
  limit?: number;
  used?: number;
  createdAt: string;
  createdBy: string;
}

export interface BotTheme {
  id: number;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  messageSpacing?: 'compact' | 'normal' | 'relaxed';
  createdAt: string;
  updatedAt: string;
}

export interface BotQuickPrompt {
  id: number;
  title: string;
  prompt: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type BotRagMode = 'naive' | 'advanced' | 'agentic';

export interface Bot {
  id: number;
  isAdvanced?: boolean;
  isActive?: boolean;
  webSearchEnabled?: boolean;
  ragMode?: BotRagMode;
  maxContextSnippets?: number;
  documentSimilarityThreshold?: number;
  isPubliclyDeployed?: boolean;
  budget?: number | string | null;
  budgetUsed?: number | string;
  botGroup: {
    id: number;
    title: string;
    description: string;
    botsCount: number;
    collaborators: string[];
    createdAt: string;
    updatedAt: string;
  };
  title: string;
  subject: string;
  topic: string;
  dareFileIds: number[];
  filesCount: number;
  modelPreference?: BotModelPreference;
  prompts?: BotPrompt;
  accessCode?: BotAccessCode;
  theme?: BotTheme;
  quickPrompts?: BotQuickPrompt[];
  createdById: number;
  createdByDareId?: number;
  redeemed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBotRequest {
  title: string;
  subject: string;
  topic: string;
  accessCode?: string;
  isActive?: boolean;
  webSearchEnabled?: boolean;
  ragMode?: BotRagMode;
  maxContextSnippets?: number;
  documentSimilarityThreshold?: number;
  accessCodeLimit?: number;
}

export interface UpdateBotRequest {
  title?: string;
  subject?: string;
  topic?: string;
  accessCode?: string;
  isActive?: boolean;
  webSearchEnabled?: boolean;
  ragMode?: BotRagMode;
  maxContextSnippets?: number;
  documentSimilarityThreshold?: number;
  accessCodeLimit?: number;
  isPubliclyDeployed?: boolean;
  budget?: number;
}

export interface BotModelPreferenceRequest {
  chatModelDareId?: string | null;
  trackingModelDareId?: string | null;
}

export interface BotPromptRequest {
  greeting?: string;
  chatPrompt?: string;
  trackingPrompt?: string;
  learningGoals?: string;
}

export interface BotThemeRequest {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  messageSpacing?: 'compact' | 'normal' | 'relaxed';
}
