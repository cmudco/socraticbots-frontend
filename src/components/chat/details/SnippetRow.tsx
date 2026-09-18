import React from 'react';

import { hopVerb } from '@/types/messageDetails';

/**
 * Hide numeric labels that round to zero; relative bars still show ranking.
 * These relevance scores are not probabilities of answer correctness.
 */
const MIN_MEANINGFUL_SCORE = 0.01;

interface SnippetRowProps {
  rank: number;
  citationId?: string | null;
  refLabel: string;
  preview: string;
  score: number;
  /** Highest score among the displayed set — bar widths are relative to it. */
  maxScore: number;
  /** "p. 212 · 7.3 Open addressing" when the backend knows it. */
  location?: string;
  via?: string | null;
  viaKind?: string | null;
}

/** One kept snippet, one compact line: rank, source, preview, relevance bar. */
const SnippetRow: React.FC<SnippetRowProps> = ({
  rank,
  citationId,
  refLabel,
  preview,
  score,
  maxScore,
  location,
  via,
  viaKind,
}) => {
  const ratio = maxScore > 0 ? Math.min(1, Math.max(0, score / maxScore)) : 0;
  return (
    <div className="py-0.5 text-xs leading-tight">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground min-w-4 shrink-0 text-right font-mono">
          {citationId ? `[${citationId}]` : `${rank}.`}
        </span>
        <span className="text-foreground max-w-[30%] shrink-0 truncate font-medium">
          {refLabel}
        </span>
        <span className="text-muted-foreground min-w-0 flex-1 truncate">{preview}</span>
        <span className="bg-border h-1 w-12 shrink-0 overflow-hidden rounded-full">
          <span
            className="bg-primary block h-full rounded-full"
            style={{ width: `${Math.max(4, Math.round(ratio * 100))}%` }}
          />
        </span>
        {score >= MIN_MEANINGFUL_SCORE && (
          <span className="text-muted-foreground w-9 shrink-0 text-right font-mono tabular-nums">
            {score.toFixed(2)}
          </span>
        )}
      </div>
      {(location || via) && (
        <div className="text-muted-foreground ml-6 flex flex-wrap items-center gap-1.5 text-[11px]">
          {location && <span>{location}</span>}
          {via && (
            <span className="bg-primary/10 text-primary rounded-full px-1.5">
              {hopVerb(viaKind)} "{via}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SnippetRow;
