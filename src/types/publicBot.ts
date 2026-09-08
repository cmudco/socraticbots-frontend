/**
 * Public bot types for anonymous chat functionality
 */
import type { Bot } from './bot';
import type { ContextTrace } from './contextTrace';
import type { ChatToolCall } from './toolCalls';

// Public bot info is the same as regular bot info
// Backend returns full bot details via BotDetailSerializer
export type PublicBotInfo = Bot;

export interface PublicBotConversation {
  dareConversationId: string;
  botId: number;
  botName: string;
}

export interface PublicBotMessage {
  id: string;
  message: string;
  senderType: 'USER' | 'ASSISTANT';
  senderName: string;
  isSender: boolean;
  date: string;
  streaming?: boolean;
  toolCalls?: ChatToolCall[];
  contextTrace?: ContextTrace;
  llmId?: number;
  cost?: number;
  inputTokens?: number;
  outputTokens?: number;
  feedbackType?: number | null;
  feedbackText?: string | null;
  isEdited?: boolean;
  isRegenerated?: boolean;
  originalMessage?: string | null;
}
