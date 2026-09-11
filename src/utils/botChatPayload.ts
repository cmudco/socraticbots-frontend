import type { Bot } from '@/types/bot';
import type { SendMessagePayload } from '@/types/socket';

import { isProgressTrackingConfigured } from './progressTracking';

/** DARE's socket uses camelCase routing keys and snake_case generation options.
 * Keep this wire boundary shared by authenticated and public Socratic chat.
 */
export function buildBotChatPayload(bot: Bot, message: string): SendMessagePayload {
  return {
    message,
    sender_type: 1,
    model_id: bot.modelPreference?.chatModelDareId,
    rag_mode: bot.ragMode ?? 'advanced',
    embedding_ids: bot.dareFileIds ?? [],
    file_owner_id: bot.createdByDareId,
    web_search_enabled: Boolean(bot.webSearchEnabled),
    max_context_snippets: bot.maxContextSnippets,
    document_similarity_threshold: bot.documentSimilarityThreshold,
    is_advanced: Boolean(bot.isAdvanced),
    enable_progress: isProgressTrackingConfigured(bot),
    progress_llm_id: bot.modelPreference?.trackingModelDareId,
    bot_meta: {
      title: bot.title,
      subject: bot.subject,
      topic: bot.topic,
      chat_prompt: bot.prompts?.chatPrompt,
      tracking_prompt: bot.prompts?.trackingPrompt,
      learning_goals: bot.prompts?.learningGoals,
    },
  };
}
