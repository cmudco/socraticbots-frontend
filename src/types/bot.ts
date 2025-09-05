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
  created_at: string;
  created_by: string;
}

export interface Bot {
  id: number;
  isAdvanced?: boolean;
  maxContextSnippets?: number;
  documentSimilarityThreshold?: number;
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
  maxContextSnippets?: number;
  documentSimilarityThreshold?: number;
}

export interface UpdateBotRequest {
  title?: string;
  subject?: string;
  topic?: string;
  accessCode?: string;
  maxContextSnippets?: number;
  documentSimilarityThreshold?: number;
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
