import { z } from 'zod';

import {
  ConversationStatus,
  TranscriptRole,
  type VoiceConversation,
  type VoiceConversationListItem,
  VoiceProvider,
  type VoiceSessionStatusResponse,
} from '@/types/voiceAgent';

// Validate the rendered wire payload. Do not camelize it a second time.
export const voiceSessionStatusSchema = z.object({
  status: z.nativeEnum(ConversationStatus),
  endedReason: z.string().nullable(),
}) satisfies z.ZodType<VoiceSessionStatusResponse>;

export const voiceConversationListItemSchema = voiceSessionStatusSchema.extend({
  id: z.number().int(),
  agent: z.number().int(),
  agentName: z.string(),
  agentVoiceProvider: z.nativeEnum(VoiceProvider),
  userEmail: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  sessionActivity: z
    .enum(['never_connected', 'connected_no_transcript', 'greeting_only', 'conversation'])
    .nullable(),
}) satisfies z.ZodType<VoiceConversationListItem>;

export const voiceConversationSchema = voiceConversationListItemSchema.extend({
  user: z.number().int(),
  elevenlabsConversationId: z.string(),
  providerConversationId: z.string().nullable(),
  createdAt: z.string(),
  transcript: z.array(
    z.object({
      role: z.nativeEnum(TranscriptRole),
      message: z.string(),
      timeInCallSecs: z.number().optional(),
    })
  ),
}) satisfies z.ZodType<VoiceConversation>;
