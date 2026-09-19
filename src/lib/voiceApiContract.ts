import { z } from 'zod';

import {
  ConversationStatus,
  TranscriptRole,
  type VoiceConversation,
  type VoiceConversationListItem,
  VoiceProvider,
  type VoiceSessionStatusResponse,
} from '@/types/voiceAgent';
import { VOICE_ERROR_NAMES } from '@/types/voiceDiagnostics';

export const voiceBrowserEventSchema = z.object({
  sequence: z.number().int().nonnegative(),
  elapsedMs: z.number().int().nonnegative(),
  stage: z.enum(['microphone', 'reservation', 'connection', 'active', 'ending']),
  kind: z.enum([
    'network_offline',
    'network_online',
    'microphone_ready',
    'microphone_error',
    'microphone_muted',
    'microphone_unmuted',
    'microphone_ended',
    'peer_state',
    'start_failed',
    'client_end',
  ]),
  online: z.boolean(),
  errorName: z.enum(VOICE_ERROR_NAMES).optional(),
  peerState: z
    .enum(['new', 'connecting', 'connected', 'disconnected', 'failed', 'closed'])
    .optional(),
});

// Validate the rendered wire payload. Do not camelize it a second time.
export const voiceSessionStatusSchema = z.object({
  status: z.nativeEnum(ConversationStatus),
  endedReason: z.string().nullable(),
}) satisfies z.ZodType<VoiceSessionStatusResponse>;

export const voiceConversationListItemSchema = voiceSessionStatusSchema.extend({
  browserDiagnostics: z.array(voiceBrowserEventSchema).max(64).default([]),
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
}) satisfies z.ZodType<VoiceConversationListItem, z.ZodTypeDef, unknown>;

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
}) satisfies z.ZodType<VoiceConversation, z.ZodTypeDef, unknown>;
