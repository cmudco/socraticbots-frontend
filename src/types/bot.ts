export interface BotModelPreference {
  id: number;
  chatModelDareId?: number;
  trackingModelDareId?: number;
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
  created_at: string;
  created_by: string;
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

export interface Bot {
  id: number;
  isAdvanced?: boolean;
  isActive?: boolean;
  webSearchEnabled?: boolean;
  maxContextSnippets?: number;
  documentSimilarityThreshold?: number;
  isPubliclyDeployed?: boolean;
  budget?: number;
  budgetUsed?: number;
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
  maxContextSnippets?: number;
  documentSimilarityThreshold?: number;
  accessCodeLimit?: number;
  isPubliclyDeployed?: boolean;
  budget?: number;
}

export interface BotModelPreferenceRequest {
  chatModelDareId?: number;
  trackingModelDareId?: number;
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
