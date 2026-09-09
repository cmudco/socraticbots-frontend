import React from 'react';

import { ArrowUp } from 'lucide-react';

import type { RetrievalTraceEntry } from '@/types/messageDetails';

const fmtScore = (score: number): string =>
  Math.abs(score) < 1 ? score.toFixed(3) : score.toFixed(2);
const EntryRow: React.FC<{
  entry: RetrievalTraceEntry;
  showMove?: boolean;
}> = ({ entry, showMove }) => {
  const climbed = showMove && entry.prevRank !== null && entry.prevRank > entry.rank;
  return (
    <div className="flex min-w-0 items-start justify-between gap-2 py-0.5 text-xs">
      <span className="text-muted-foreground min-w-0 flex-1 truncate">
        <span className="text-foreground">{entry.rank}.</span> {entry.sourceRef}
      </span>
      <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {climbed && (
          <span className="bg-muted flex items-center rounded px-1 text-emerald-600 dark:text-emerald-400">
            <ArrowUp className="h-3 w-3" />#{entry.prevRank}
          </span>
        )}
        <span className="text-muted-foreground font-mono">{fmtScore(entry.score)}</span>
      </span>
    </div>
  );
};

export default EntryRow;
