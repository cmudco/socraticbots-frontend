import type {
  ChatClientEvents,
  ChatEventType,
  ChatSendOptions,
  ChatWireMessage,
} from '@cmudco/chat-socket-contract';

import type { MessageDiagnostics } from './messageDetails';

export type { SocketResponse, BotMeta } from '@cmudco/chat-socket-contract';

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

export type ClientToServerEvents = ChatClientEvents;

// ════════════════════════════════════════════════════════════════════════════
// Message Types
// ════════════════════════════════════════════════════════════════════════════

/**
 * Union of all possible message types from the server
 */
export type SocketMessageType = ChatEventType;

/**
 * Base socket message with all possible fields
 */
export interface SocketMessage extends ChatWireMessage, MessageDiagnostics {
  type: SocketMessageType;

  chunk?: string;
  token?: string;
  isSender?: boolean;

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
export interface SendMessagePayload extends ChatSendOptions {
  message: string;
  conversationId?: string;
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
