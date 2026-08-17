import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import type { Bot } from '@/types/bot';

// Interface for bot groups response from API
export interface BotGroup {
  id: number;
  title: string;
  description: string;
  botsCount: number;
  createdAt: string;
  updatedAt: string;
  bots: Bot[];
  collaborators: string[];
}

// Types based on DARE's conversation structure
export interface DareConversation {
  conversationId: string;
  title?: string;
  createdAt: string;
  user?: string;
  maxContextSnippets: number;
  documentSimilarityThreshold: number;
  temperature: number;
  maxTokens: number;
  historyLimit: number;
  promptId?: string | null;
  sortOrder?: number;
  selectedEmbeddingIds?: number[];
  selectedFileIds?: number[];
}

export interface DareMessage {
  id: string;
  message: string;
  senderType: 'USER' | 'ASSISTANT';
  senderName: string;
  isSender: boolean;
  date: string;
  llmId?: number;
  streaming?: boolean;
  feedbackType?: string | null;
  feedbackText?: string;
  isEdited?: boolean;
  isRegenerated?: boolean;
  originalMessage?: string;
  cost?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  toolCalls?: import('@/types/toolCalls').ChatToolCall[];
  contextTrace?: import('@/types/contextTrace').ContextTrace;
}

export interface BotConversationResponse {
  dareConversationId: string;
  botId: number;
  botName: string;
  identifier: string;
}

export interface SendMessageRequest {
  conversationId: string;
  message: string;
  streaming?: boolean;
}

/**
 * Service for managing bot conversations through proxy to DARE backend
 */
class ConversationService {
  /**
   * Get all available bots from bot groups
   */
  async getAvailableBots(): Promise<Bot[]> {
    // Get bot groups with complete bot objects
    const botGroups = await baseRequest<BotGroup[]>({
      url: 'bot-groups/',
      method: METHOD.GET,
    });

    // Flatten to get all available bots - no mapping needed, return complete objects!
    const availableBots: Bot[] = [];
    for (const group of botGroups) {
      if (group.bots) {
        availableBots.push(...group.bots);
      }
    }

    return availableBots;
  }

  /**
   * Create or get existing conversation for a bot and authenticated user
   * Uses bot_id + user_id to create deterministic conversation in DARE
   * No local conversation models - works directly with DARE backend
   */
  async getOrCreateBotConversation(botId: number): Promise<BotConversationResponse> {
    return baseRequest<BotConversationResponse>({
      url: `conversations/bots/${botId}/conversations/`,
      method: METHOD.POST,
    });
  }

  // getConversationHistory removed - WebSocket handles message history automatically

  /**
   * Get available LLM models from DARE
   */
  async getAvailableModels(): Promise<unknown[]> {
    return baseRequest<unknown[]>({
      url: 'conversations/models/',
      method: METHOD.GET,
    });
  }

  /**
   * Delete conversation and all its messages/learning progress from DARE
   */
  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
    return baseRequest<{ success: boolean; message: string }>({
      url: `conversations/${conversationId}/delete/`,
      method: METHOD.DELETE,
    });
  }

  async deleteMessage(messageId: string): Promise<{ success: boolean; message: string }> {
    return baseRequest<{ success: boolean; message: string }>({
      url: `conversations/messages/${messageId}/delete/`,
      method: METHOD.DELETE,
    });
  }

  async exportConversationPdf(conversationId: string): Promise<{ blob: Blob; filename: string }> {
    return baseRequest({
      url: `conversations/${conversationId}/export-pdf/`,
      method: METHOD.GET,
      responseType: 'blob',
    });
  }
}

export const conversationService = new ConversationService();
