import type { BotRagMode } from './bot';
import type { ImagePayload, SocketFile } from './chatAttachments';
import type { MessageDiagnostics } from './messageDetails';

export type { SocketAuth } from '@/config/socket.config';

/**
 * Socket.IO Type Definitions for Socratic Books
 *
 * These types mirror the DARE backend Socket.IO event structure
 * with additions for Socratic Books-specific learning progress events.
 */

// ════════════════════════════════════════════════════════════════════════════
// Server → Client Events
// ════════════════════════════════════════════════════════════════════════════

export interface ServerToClientEvents {
  message: (data: SocketMessage) => void;
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
}

// ════════════════════════════════════════════════════════════════════════════
// Client → Server Events
// ════════════════════════════════════════════════════════════════════════════

export interface ClientToServerEvents {
  subscribe_conversation: (
    data: { conversationId: string },
    callback: (response: SocketResponse) => void
  ) => void;
  unsubscribe_conversation: (
    data: { conversationId: string },
    callback: (response: SocketResponse) => void
  ) => void;
  send_message: (
    data: Record<string, unknown>,
    callback: (response: SocketResponse) => void
  ) => void;
  stop_generation: (
    data: { conversationId: string },
    callback: (response: SocketResponse) => void
  ) => void;
  edit_message: (
    data: { conversationId: string; messageId: string; message: string },
    callback: (response: SocketResponse) => void
  ) => void;
  regenerate_response: (
    data: Record<string, unknown>,
    callback: (response: SocketResponse) => void
  ) => void;
}

// ════════════════════════════════════════════════════════════════════════════
// Response Types
// ════════════════════════════════════════════════════════════════════════════

export interface SocketResponse {
  success?: boolean;
  error?: string;
  conversationId?: string;
}

// ════════════════════════════════════════════════════════════════════════════
// Message Types
// ════════════════════════════════════════════════════════════════════════════

/**
 * Union of all possible message types from the server
 */
export type SocketMessageType =
  | 'conversation_history'
  | 'message'
  | 'ai_stream'
  | 'stream_chunk'
  | 'stream_end'
  | 'edit_message'
  // Tool loop (unified vocabulary shared with DARE chat)
  | 'tool_call_pending'
  | 'tool_call_args_progress'
  | 'tool_call_executing'
  | 'tool_call_result'
  | 'tool_rounds_capped'
  | 'context_trace'
  // Socratic Books specific - Learning Progress
  | 'progress_start'
  | 'progress_token'
  | 'progress_stream'
  | 'progress_complete'
  | 'progress_error'
  | 'progress_end'
  | 'latest_progress'
  // Error
  | 'error';

/**
 * Base socket message with all possible fields
 */
export interface SocketMessage extends MessageDiagnostics {
  type: SocketMessageType;

  // Message identification
  id?: string | number;
  messageId?: string | number;

  // Message content
  message?: string;
  chunk?: string;
  token?: string;

  // Sender info
  senderType?: number; // 1 = USER, 2 = ASSISTANT
  senderName?: string;
  sender?: string;
  isSender?: boolean;

  // Timestamps
  date?: string;
  createdAt?: string;

  // Streaming state
  streaming?: boolean;
  isComplete?: boolean;

  // Message metadata
  llmId?: number;
  cost?: number | string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;

  // Files DARE persisted on the message (attached images among them)
  files?: SocketFile[];

  // Feedback
  feedbackType?: number | null;
  feedbackText?: string | null;

  // Edit/Regenerate state
  isEdited?: boolean;
  isRegenerated?: boolean;
  originalMessage?: string | null;
  regenerate?: boolean;

  // Conversation history (for initial load)
  conversationHistory?: ConversationHistoryMessage[];

  // Learning progress assessment (Socratic Books specific)
  assessment?: LearningProgressAssessment;

  // Error info
  errorCode?: string;
  errorMessage?: string;
  details?: Record<string, unknown>;

  // Conversation context
  conversationId?: string;

  // Allow additional fields
  [key: string]: unknown;
}

/**
 * Message in conversation history
 */
export interface ConversationHistoryMessage extends MessageDiagnostics {
  id: string | number;
  message: string;
  senderType: number;
  senderName?: string;
  sender?: string;
  isSender?: boolean;
  date?: string;
  createdAt?: string;
  streaming?: boolean;
  llmId?: number;
  cost?: number | string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  feedbackType?: number | null;
  feedbackText?: string | null;
  isEdited?: boolean;
  isRegenerated?: boolean;
  originalMessage?: string | null;
  files?: SocketFile[];
  /** Tool calls made during this message's turn (camelized by DARE). */
  toolCalls?: Array<Record<string, unknown>>;
  /** Context-assembly trace persisted for this message's turn. */
  contextTrace?: Record<string, unknown> | null;
}

/**
 * Learning progress assessment structure (Socratic Books specific)
 */
export interface LearningProgressAssessment {
  content: string;
  learningGoals?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

// ════════════════════════════════════════════════════════════════════════════
// Payload Types
// ════════════════════════════════════════════════════════════════════════════

/**
 * Bot metadata sent with messages (Socratic Books specific)
 */
export interface BotMeta {
  title?: string;
  subject?: string;
  topic?: string;
  learning_goals?: string;
  chat_prompt?: string;
  tracking_prompt?: string;
}

/**
 * Payload for sending messages
 */
export interface SendMessagePayload {
  conversationId?: string;
  message: string;
  sender_type?: number;

  // Socratic Books specific
  enable_progress?: boolean;
  is_advanced?: boolean;
  tracking_prompt?: string;
  learning_goals?: string;
  // Opaque DARE picker id ("42" or "litellm:<key>:<name>") for the
  // tracker model. SB-specific field; DARE resolves via parse_model_id.
  progress_llm_id?: string | null;
  bot_meta?: BotMeta;

  // LLM configuration. `model_id` is the new opaque dispatch field on
  // DARE's chat socket (replaces the legacy `llm_id`).
  model_id?: string | null;
  prompt_id?: number;
  temperature?: number;
  max_tokens?: number;

  // Images attached in the composer; DARE stores them as message files.
  images?: ImagePayload[];

  // Context configuration
  file_ids?: number[];
  embedding_ids?: number[];
  file_owner_id?: number;
  rag_mode?: BotRagMode;
  media_ids?: number[];
  tag_ids?: number[];
  folder_ids?: number[];
  max_context_snippets?: number;
  document_similarity_threshold?: number;
  history_limit?: number;

  // Features
  web_search_enabled?: boolean;
  image_generation_enabled?: boolean;
  audio_transcription_enabled?: boolean;

  // Allow additional fields
  [key: string]: unknown;
}

/**
 * Payload for regenerating responses
 */
export interface RegeneratePayload {
  conversationId: string;
  message_id: string;
  // Opaque DARE picker id; aligns with the chat-send `model_id` field.
  model_id?: string | null;
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
}

// ════════════════════════════════════════════════════════════════════════════
// Connection Types
// ════════════════════════════════════════════════════════════════════════════

/**
 * Authentication options for socket connection
 */
/**
 * Connection status
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
