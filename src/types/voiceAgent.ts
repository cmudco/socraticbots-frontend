/**
 * TypeScript types for Voice Agent feature.
 */

// ElevenLabs conversation config types
export interface ElevenLabsTurnConfig {
  turnTimeout?: number;
  silenceEndCallTimeout?: number;
  turnEagerness?: 'low' | 'normal' | 'high';
  spellingPatience?: 'auto' | 'low' | 'normal' | 'high';
}

export interface ElevenLabsTtsConfig {
  modelId?: string;
  voiceId?: string;
  stability?: number;
  speed?: number;
  similarityBoost?: number;
}

export interface ElevenLabsConversationSettings {
  maxDurationSeconds?: number;
}

export interface ElevenLabsPromptConfig {
  prompt?: string;
  llm?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ElevenLabsAgentConfig {
  firstMessage?: string;
  language?: string;
  prompt?: ElevenLabsPromptConfig;
}

export interface ConversationConfig {
  turn?: ElevenLabsTurnConfig;
  tts?: ElevenLabsTtsConfig;
  conversation?: ElevenLabsConversationSettings;
  agent?: ElevenLabsAgentConfig;
}

export interface VoiceAgent {
  id: number;
  user: number;
  userEmail: string;
  name: string;
  description: string;
  elevenlabsAgentId: string | null;
  voiceId: string;
  systemPrompt: string;
  firstMessage: string;
  temperature: number;
  maxDurationSeconds: number;
  examTitle: string;
  examInstructions: string;
  status: 'draft' | 'active';
  conversationConfig: ConversationConfig | null;
  conversationCount: number;
  accessCodeForAdmin?: string | null;
  hasUserAccess?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceAgentListItem {
  id: number;
  user: number;
  userEmail: string;
  name: string;
  description: string;
  status: 'draft' | 'active';
  examTitle: string;
  createdAt: string;
}

export interface VoiceAgentCreateData {
  name: string;
  description?: string;
  voiceId?: string;
  systemPrompt: string;
  firstMessage?: string;
  temperature?: number;
  maxDurationSeconds?: number;
  examTitle?: string;
  examInstructions?: string;
  status?: 'draft' | 'active';
  conversationConfig?: ConversationConfig;
  accessCode?: string;
}

export interface VoiceAgentUpdateData {
  name?: string;
  description?: string;
  voiceId?: string;
  systemPrompt?: string;
  firstMessage?: string;
  temperature?: number;
  maxDurationSeconds?: number;
  examTitle?: string;
  examInstructions?: string;
  status?: 'draft' | 'active';
  conversationConfig?: ConversationConfig;
  accessCode?: string;
}

export interface VoiceConversation {
  id: number;
  agent: number;
  agentName: string;
  user: number;
  userEmail: string;
  elevenlabsConversationId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  transcript: TranscriptMessage[];
  createdAt: string;
}

export interface VoiceConversationListItem {
  id: number;
  agent: number;
  agentName: string;
  userEmail: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

export interface TranscriptMessage {
  role: 'user' | 'agent';
  message: string;
  time_in_call_secs?: number;
}

export interface SignedUrlResponse {
  signedUrl: string;
  agentId: string;
}

export interface ElevenLabsVoice {
  voiceId: string;
  name: string;
  previewUrl?: string | null;
  category?: string | null;
}

// ElevenLabs agent from their API (not synced to local DB yet)
export interface ElevenLabsAgentItem {
  agentId: string;
  name: string;
  isSynced: boolean;
  conversationConfig?: {
    agent?: {
      prompt?: {
        prompt?: string;
      };
      firstMessage?: string;
    };
  };
}
