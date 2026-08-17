/**
 * Tool-call activity on chat messages.
 *
 * Mirrors DARE's unified tool-loop vocabulary (tool_call_pending /
 * tool_call_args_progress / tool_call_executing / tool_call_result socket
 * events, and the `toolCalls` array on history messages). SB currently only
 * receives `search_documents` calls (agentic document retrieval), but the
 * shape is origin-agnostic so future tools render without type changes.
 */

export type ChatToolCallStatus = 'pending' | 'executing' | 'completed' | 'failed';

export interface ChatToolCall {
  toolCallId: string;
  toolName: string;
  serverSlug?: string;
  origin?: string;
  round?: number;
  status: ChatToolCallStatus;
  /** Streaming argument progress (pending state only). */
  argsChars?: number;
  arguments?: Record<string, unknown>;
  error?: string | null;
  /** Collapsed result payload (dareResult / mcpResult / providerResult). */
  result?: Record<string, unknown> | null;
  executionTimeMs?: number;
}

/** Normalize a history-message tool call (REST/socket serializer shape). */
export function toolCallFromHistory(raw: Record<string, unknown>): ChatToolCall {
  const result =
    (raw.dareResult as Record<string, unknown>) ??
    (raw.providerResult as Record<string, unknown>) ??
    (raw.mcpResult as Record<string, unknown>) ??
    null;
  return {
    toolCallId: String(raw.toolCallId ?? raw.id ?? ''),
    toolName: String(raw.toolName ?? ''),
    serverSlug: raw.serverSlug as string | undefined,
    origin: raw.origin as string | undefined,
    round: (raw.round ?? raw.roundIndex) as number | undefined,
    status: (raw.status as ChatToolCallStatus) ?? 'completed',
    arguments: raw.arguments as Record<string, unknown> | undefined,
    error: raw.error as string | null | undefined,
    result,
    executionTimeMs: raw.executionTimeMs as number | undefined,
  };
}
