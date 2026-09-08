import type { SocketMessage } from './socket';

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

/** Map a tool-loop socket event to a partial ChatToolCall for upserting. */
export const mapToolEvent = (data: SocketMessage): Partial<ChatToolCall> | null => {
  const base = {
    toolCallId: data.toolCallId as string,
    toolName: data.toolName as string | undefined,
    serverSlug: data.serverSlug as string | undefined,
    origin: data.origin as string | undefined,
    round: data.round as number | undefined,
  };
  switch (data.type) {
    case 'tool_call_pending':
      return { ...base, status: 'pending' };
    case 'tool_call_args_progress':
      return { toolCallId: base.toolCallId, argsChars: data.argsChars as number };
    case 'tool_call_executing':
      return {
        ...base,
        status: 'executing',
        arguments: data.arguments as Record<string, unknown> | undefined,
      };
    case 'tool_call_result':
      return {
        ...base,
        status: data.status === 'failed' ? 'failed' : 'completed',
        error: (data.error as string | null | undefined) ?? undefined,
        result:
          (data.dareResult as Record<string, unknown>) ??
          (data.providerResult as Record<string, unknown>) ??
          (data.mcpResult as Record<string, unknown>) ??
          null,
      };
    default:
      return null;
  }
};
