/**
 * TypeScript types for Voice Agent feature.
 */

// ── Enums ──

export enum AgentStatus {
  Draft = 'draft',
  Active = 'active',
}

export enum VoiceProvider {
  ElevenLabs = 'elevenlabs',
  // Mistral Voxtral via the full-duplex Pipecat runtime
  // (server-side VAD + barge-in + streaming).
  MistralVoice = 'mistral_pipecat',
}

export enum VoiceEagerness {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
}

export enum TurnEagerness {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
}

export enum SpellingPatience {
  Auto = 'auto',
  Low = 'low',
  Normal = 'normal',
  High = 'high',
}

export enum ConversationStatus {
  Reserved = 'reserved',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export enum TranscriptRole {
  User = 'user',
  Agent = 'agent',
}

export enum TeamMemberRole {
  Manager = 'manager',
  Admin = 'admin',
  Reviewer = 'reviewer',
}

export enum AgentMemberRole {
  Admin = 'admin',
  Reviewer = 'reviewer',
}

// ElevenLabs conversation config types
export interface ElevenLabsTurnConfig {
  turnTimeout?: number;
  silenceEndCallTimeout?: number;
  turnEagerness?: TurnEagerness;
  spellingPatience?: SpellingPatience;
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

// Access levels returned by the backend
export type VoiceAccessLevel =
  | 'supervisor'
  | 'owner'
  | 'manager'
  | 'admin'
  | 'reviewer'
  | 'student';

export interface VoicePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canManageAccess: boolean;
  canViewTranscripts: boolean;
  canLaunchExam: boolean;
  isStaff: boolean;
  accessLevel: VoiceAccessLevel | null;
}

// Team types
export interface VoiceTeam {
  id: number;
  name: string;
  description: string;
  createdBy: number;
  createdByEmail: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceTeamWithMembers extends VoiceTeam {
  members: VoiceTeamMembership[];
}

export interface VoiceTeamMembership {
  id: number;
  team: number;
  user: number;
  userEmail: string;
  role: TeamMemberRole;
  grantedBy: number;
  grantedByEmail: string | null;
  createdAt: string;
}

export interface VoiceAgentMembership {
  id: number;
  agent: number;
  user: number;
  userEmail: string;
  role: AgentMemberRole;
  grantedBy: number;
  grantedByEmail: string | null;
  createdAt: string;
}

export interface AgentMembersResponse {
  teamMembers: VoiceTeamMembership[];
  agentMembers: VoiceAgentMembership[];
}

export interface VoiceAgent {
  id: number;
  user: number;
  userEmail: string;
  name: string;
  description: string;
  team: number | null;
  teamName: string | null;
  elevenlabsAgentId: string | null;
  voiceProvider: VoiceProvider;
  voiceId: string;
  language: string;
  systemPrompt: string;
  firstMessage: string;
  temperature: number;
  maxDurationSeconds: number;
  voiceEagerness: VoiceEagerness;
  voiceTurnTimeoutSecs: number;
  examTitle: string;
  examInstructions: string;
  status: AgentStatus;
  conversationConfig: ConversationConfig | null;
  conversationCount: number;
  accessCodeForAdmin?: string | null;
  hasUserAccess?: boolean;
  permissions: VoicePermissions;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceAgentListItem {
  id: number;
  user: number;
  userEmail: string;
  name: string;
  description: string;
  team: number | null;
  teamName: string | null;
  voiceProvider: VoiceProvider;
  status: AgentStatus;
  examTitle: string;
  accessLevel: VoiceAccessLevel | null;
  createdAt: string;
}

export interface VoiceAgentCreateData {
  name: string;
  description?: string;
  voiceId?: string;
  voiceProvider?: VoiceProvider;
  language?: string;
  systemPrompt: string;
  firstMessage?: string;
  temperature?: number;
  maxDurationSeconds?: number;
  voiceEagerness?: VoiceEagerness;
  voiceTurnTimeoutSecs?: number;
  examTitle?: string;
  examInstructions?: string;
  status?: AgentStatus;
  conversationConfig?: ConversationConfig;
  accessCode?: string;
  team?: number | null;
}

export interface VoiceAgentUpdateData {
  name?: string;
  description?: string;
  voiceId?: string;
  voiceProvider?: VoiceProvider;
  language?: string;
  systemPrompt?: string;
  firstMessage?: string;
  temperature?: number;
  maxDurationSeconds?: number;
  voiceEagerness?: VoiceEagerness;
  voiceTurnTimeoutSecs?: number;
  examTitle?: string;
  examInstructions?: string;
  status?: AgentStatus;
  conversationConfig?: ConversationConfig;
  accessCode?: string;
  team?: number | null;
}

export interface VoiceConversation {
  id: number;
  agent: number;
  agentName: string;
  agentVoiceProvider: VoiceProvider;
  user: number;
  userEmail: string;
  elevenlabsConversationId: string;
  providerConversationId: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  status: ConversationStatus;
  transcript: TranscriptMessage[];
  runtimeMetrics?: VoiceRuntimeMetrics;
  createdAt: string;
}

export interface VoiceRuntimeMetrics {
  runtime?: string;
  sttModel?: string;
  sttTargetDelayMs?: number;
  ttsModel?: string;
  ttsVoice?: string;
  startup?: {
    totalSecs?: number;
    clientConnectedSecs?: number;
  };
  latency?: {
    firstBotSpeechSecs?: number;
    lastUserToBotSecs?: number;
  };
  breakdowns?: string[][];
}

export interface VoiceConversationListItem {
  id: number;
  agent: number;
  agentName: string;
  agentVoiceProvider: VoiceProvider;
  userEmail: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  status: ConversationStatus;
}

export interface StudentAttemptInfo {
  userId: number;
  email: string;
  maxAttempts: number;
  attemptsUsed: number;
  canRetake: boolean;
  accessGrantedAt: string;
}

export interface TranscriptMessage {
  role: TranscriptRole;
  message: string;
  timeInCallSecs?: number;
}

export interface SignedUrlResponse {
  provider: VoiceProvider;
  signedUrl?: string;
  agentId?: string;
  sessionId?: string;
  webrtcUrl?: string;
  iceServers?: string[];
  token?: string;
  expiresAt?: string;
}

export interface ElevenLabsVoice {
  voiceId: string;
  name: string;
  previewUrl?: string | null;
  category?: string | null;
}

/** Normalized Mistral Voxtral voice from /api/voice/mistral-voices/. */
export interface MistralVoice {
  slug: string;
  label: string;
  locale: string; // e.g. "en-US", "en-GB", "fr-FR"
  gender: 'male' | 'female' | '';
  description: string;
  tags: string[];
}

export interface MistralVoicesResponse {
  voices: MistralVoice[];
  total: number;
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
