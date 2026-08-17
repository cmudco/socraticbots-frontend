/**
 * One tool call inside the ToolActivity panel. Ported from DARE's
 * ToolActivityRow: status icon, tool label, status text, and an expandable
 * result/error detail with technical details.
 */
import React, { useState } from 'react';

import { CheckCircle2, ChevronDown, ChevronRight, Loader2, Search, XCircle } from 'lucide-react';

import type { ChatToolCall } from '@/types/toolCalls';

const TOOL_TITLES: Record<string, string> = {
  search_documents: 'Searching documents',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'writing arguments…',
  executing: 'running…',
  completed: 'done',
  failed: 'failed',
};

const statusIcon = (status: ChatToolCall['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={14} className="shrink-0 text-green-600" />;
    case 'failed':
      return <XCircle size={14} className="text-destructive shrink-0" />;
    default:
      return <Loader2 size={14} className="text-primary shrink-0 animate-spin" />;
  }
};

const resultSummary = (toolCall: ChatToolCall): string | null => {
  const result = toolCall.result;
  if (!result) return null;
  const passages = result.passagesFound ?? result.passages_found;
  if (typeof passages === 'number') {
    return passages === 1 ? '1 passage found' : `${passages} passages found`;
  }
  return null;
};

interface ToolActivityRowProps {
  toolCall: ChatToolCall;
}

export const ToolActivityRow: React.FC<ToolActivityRowProps> = ({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const title = TOOL_TITLES[toolCall.toolName] || toolCall.toolName;
  const summary = resultSummary(toolCall);
  const query = toolCall.arguments?.query;

  const hasDetail =
    (toolCall.status === 'completed' && !!toolCall.result) ||
    (toolCall.status === 'failed' && !!toolCall.error);

  return (
    <div className="bg-card min-w-0 rounded-md p-2">
      <button
        type="button"
        className={`flex w-full items-center justify-between gap-2 border-none bg-transparent text-left ${
          hasDetail ? 'cursor-pointer' : 'cursor-default'
        }`}
        onClick={() => hasDetail && setIsExpanded(!isExpanded)}
        aria-expanded={hasDetail ? isExpanded : undefined}
      >
        <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm">
          {statusIcon(toolCall.status)}
          <Search size={14} className="text-muted-foreground shrink-0" />
          <span className="text-foreground min-w-0 font-medium">{title}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground text-xs">
            {STATUS_LABELS[toolCall.status] || toolCall.status}
          </span>
          {toolCall.status === 'pending' && !!toolCall.argsChars && (
            <span className="text-muted-foreground text-xs tabular-nums">
              · {(toolCall.argsChars / 1000).toFixed(1)}k chars written
            </span>
          )}
          {summary && <span className="text-muted-foreground text-xs">· {summary}</span>}
          {toolCall.round != null && toolCall.round > 1 && (
            <span className="text-muted-foreground text-xs">· round {toolCall.round}</span>
          )}
        </span>
        {hasDetail &&
          (isExpanded ? (
            <ChevronDown size={14} className="shrink-0" />
          ) : (
            <ChevronRight size={14} className="shrink-0" />
          ))}
      </button>

      {isExpanded && (
        <>
          {typeof query === 'string' && (
            <p className="text-muted-foreground mt-2 text-xs">
              Query: <span className="text-foreground italic">“{query}”</span>
            </p>
          )}

          {toolCall.status === 'failed' && toolCall.error && (
            <div className="bg-destructive/10 text-destructive mt-2 rounded-sm p-2 text-xs">
              {toolCall.error}
            </div>
          )}

          <details className="text-muted-foreground mt-2 text-xs">
            <summary className="cursor-pointer font-medium">Technical details</summary>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt>Tool</dt>
              <dd className="font-mono break-all">{toolCall.toolName}</dd>
              {toolCall.round != null && (
                <>
                  <dt>Round</dt>
                  <dd>{toolCall.round}</dd>
                </>
              )}
              {toolCall.executionTimeMs != null && (
                <>
                  <dt>Duration</dt>
                  <dd>{toolCall.executionTimeMs} ms</dd>
                </>
              )}
            </dl>
            {toolCall.arguments && (
              <pre className="bg-muted mt-2 max-h-48 overflow-auto rounded-sm p-2 break-words whitespace-pre-wrap">
                {JSON.stringify(toolCall.arguments, null, 2)}
              </pre>
            )}
            {toolCall.result != null && (
              <pre className="bg-muted mt-2 max-h-64 overflow-auto rounded-sm p-2 break-words whitespace-pre-wrap">
                {JSON.stringify(toolCall.result, null, 2)}
              </pre>
            )}
          </details>
        </>
      )}
    </div>
  );
};

export default ToolActivityRow;
