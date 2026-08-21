import { PipecatProcessingStage } from '@/types/pipecat';

/**
 * Pending-reply stage shown while the examiner response is in flight.
 * 'generic' is the honest fallback when the runtime has not said whether it
 * is waiting on the LLM or on TTS.
 */
export type ReplyPendingStage = PipecatProcessingStage | 'generic';

export const REPLY_PENDING_LABELS: Record<ReplyPendingStage, string> = {
  llm: 'Agent is thinking…',
  tts: 'Preparing voice…',
  generic: 'Preparing response…',
};
