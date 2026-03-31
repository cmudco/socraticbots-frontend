/**
 * TypeScript types for Voice Agent feature.
 */

// ── Enums ──

export enum AgentStatus {
  Draft = 'draft',
  Active = 'active',
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
  voiceId: string;
  systemPrompt: string;
  firstMessage: string;
  temperature: number;
  maxDurationSeconds: number;
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
  status: AgentStatus;
  examTitle: string;
  accessLevel: VoiceAccessLevel | null;
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
  status?: AgentStatus;
  conversationConfig?: ConversationConfig;
  accessCode?: string;
  team?: number | null;
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
  status?: AgentStatus;
  conversationConfig?: ConversationConfig;
  accessCode?: string;
  team?: number | null;
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
  status: ConversationStatus;
  transcript: TranscriptMessage[];
  hasAudio: boolean;
  audioUrl: string | null;
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
  status: ConversationStatus;
  hasAudio: boolean;
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
