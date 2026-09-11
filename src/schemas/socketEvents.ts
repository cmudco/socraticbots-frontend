/**
 * Zod validation for chat socket events.
 *
 * Validation is log-only: a malformed frame is reported to the console but
 * still handed to the store handlers, so a backend payload drift degrades
 * loudly instead of silently changing behavior. Tool-loop and trace event
 * schemas plug into `socketEventSchemas` as they are adopted from DARE.
 */
import { z } from 'zod';

const baseEvent = z.object({ type: z.string().min(1) }).passthrough();

// DARE serializes message ids as numbers on some events and strings on others
const messageId = z.union([z.string(), z.number()]);

const historyMessage = z
  .object({
    id: messageId,
    message: z.string().nullish(),
    senderType: z.number(),
  })
  .passthrough();

const streamedMessage = baseEvent.extend({
  id: messageId,
  message: z.string().nullish(),
  senderType: z.number().optional(),
  streaming: z.boolean().optional(),
  regenerate: z.boolean().optional(),
});

export const socketEventSchemas: Record<string, z.ZodTypeAny> = {
  conversation_history: baseEvent.extend({
    conversationHistory: z.array(historyMessage),
  }),
  message: streamedMessage,
  ai_stream: streamedMessage,
  stream_chunk: baseEvent.extend({
    messageId,
    chunk: z.string().optional(),
  }),
  stream_end: baseEvent.extend({
    messageId,
  }),
  // Tool-loop events (unified vocabulary shared with DARE chat).
  // Correlation key is messageId; payloads are camelized by the backend.
  tool_call_pending: baseEvent.extend({
    messageId: messageId.optional(),
    toolCallId: z.string(),
    toolName: z.string(),
    round: z.number().optional(),
    status: z.string().optional(),
  }),
  tool_call_args_progress: baseEvent.extend({
    messageId: messageId.optional(),
    toolCallId: z.string(),
    argsChars: z.number().optional(),
  }),
  tool_call_executing: baseEvent.extend({
    messageId: messageId.optional(),
    toolCallId: z.string(),
    toolName: z.string(),
    round: z.number().optional(),
    arguments: z.record(z.string(), z.unknown()).optional(),
  }),
  tool_call_result: baseEvent.extend({
    messageId: messageId.optional(),
    toolCallId: z.string(),
    toolName: z.string(),
    round: z.number().optional(),
    status: z.string(),
    error: z.string().nullish(),
  }),
  tool_rounds_capped: baseEvent.extend({
    messageId: messageId.optional(),
    round: z.number().optional(),
  }),
  context_trace: baseEvent.extend({
    messageId: messageId.optional(),
    trace: z.record(z.string(), z.unknown()).optional(),
  }),
  progress_start: baseEvent,
  progress_token: baseEvent.extend({ token: z.string().optional() }),
  progress_stream: baseEvent.extend({ chunk: z.string().optional() }),
  progress_complete: baseEvent,
  progress_error: baseEvent,
  progress_end: baseEvent,
  latest_progress: baseEvent.extend({
    assessment: z.object({ content: z.string().nullish() }).passthrough().nullish(),
  }),
  error: baseEvent,
};

/**
 * Validate a socket frame against the schema for its event type.
 * Unknown event types pass through untouched (forward compatibility).
 * Returns the frame either way; failures only warn.
 */
export function validateSocketEvent(data: unknown): void {
  const envelope = baseEvent.safeParse(data);
  if (!envelope.success) {
    console.warn('[socket] Frame without a valid type field:', envelope.error.issues);
    return;
  }

  const schema = socketEventSchemas[envelope.data.type];
  if (!schema) {
    return;
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn(
      `[socket] Malformed "${envelope.data.type}" event:`,
      JSON.stringify(result.error.issues)
    );
  }
}
