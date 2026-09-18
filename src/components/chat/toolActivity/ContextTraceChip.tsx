/**
 * "How this answer was built" chip — collapsed one-liner, expands to the
 * per-stage timing breakdown of the turn's context assembly.
 */
import React, { useState } from 'react';

import { ChevronDown, ChevronRight, Layers } from 'lucide-react';

import type { ContextTrace, ContextTraceStage } from '@/types/contextTrace';

const STAGE_LABELS: Record<string, string> = {
  prompt: 'System prompt',
  history: 'Conversation history',
  retrieval: 'Document retrieval',
  media: 'Media',
  tools: 'Tools',
  memory: 'Memory',
};

const stageDetail = (stage: ContextTraceStage): string => {
  const parts: string[] = [];
  if (typeof stage.chars === 'number') parts.push(`${stage.chars.toLocaleString()} chars`);
  if (typeof stage.turns === 'number') parts.push(`${stage.turns} turns`);
  if (typeof stage.count === 'number') parts.push(`${stage.count}`);
  if (stage.deferredToTool) parts.push('on-demand via search_documents');
  else if (typeof stage.mode === 'string') parts.push(String(stage.mode));
  return parts.join(' · ');
};

interface ContextTraceChipProps {
  trace: ContextTrace;
}

export const ContextTraceChip: React.FC<ContextTraceChipProps> = ({ trace }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!trace.stages?.length) return null;

  return (
    <div className="bg-muted/50 mb-2 rounded-lg p-1.5">
      <button
        type="button"
        className="text-muted-foreground flex w-full cursor-pointer items-center gap-1.5 border-none bg-transparent text-left text-xs"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <Layers size={13} className="shrink-0" />
        <span className="font-medium">Context</span>
        <span>
          · {trace.stages.length} {trace.stages.length === 1 ? 'stage' : 'stages'} · {trace.totalMs}{' '}
          ms
        </span>
        {isExpanded ? (
          <ChevronDown size={13} className="ml-auto shrink-0" />
        ) : (
          <ChevronRight size={13} className="ml-auto shrink-0" />
        )}
      </button>

      {isExpanded && (
        <dl className="text-muted-foreground mt-2 grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 px-1 text-xs">
          {trace.stages.map((stage, i) => (
            <React.Fragment key={`${stage.kind}-${i}`}>
              <dt className="text-foreground font-medium">
                {STAGE_LABELS[stage.kind] || stage.kind}
              </dt>
              <dd className="min-w-0 truncate">{stageDetail(stage)}</dd>
              <dd className="tabular-nums">{stage.ms != null ? `${stage.ms} ms` : ''}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
    </div>
  );
};

export default ContextTraceChip;
