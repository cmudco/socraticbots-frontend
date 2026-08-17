/**
 * Per-turn context-assembly trace, mirroring DARE's `context_trace` event
 * and the `contextTrace` field on history messages.
 */

export interface ContextTraceStage {
  kind: string;
  ms?: number;
  [key: string]: unknown;
}

export interface ContextTrace {
  totalMs: number;
  stages: ContextTraceStage[];
}
