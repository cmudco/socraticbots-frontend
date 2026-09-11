import React from 'react';

import { type RetrievalTrace, type RetrievalTraceEntry } from '@/types/messageDetails';

import SnippetRow from './SnippetRow';

const locationOf = (entry: RetrievalTraceEntry): string | undefined => {
  const parts = [entry.pageNo != null ? `p. ${entry.pageNo}` : '', entry.section ?? ''].filter(
    Boolean
  );
  return parts.length ? parts.join(' · ') : undefined;
};

/** Snippets an advanced retrieval source kept, with the pool→kept header. */
export const SourceSnippets: React.FC<{ source: RetrievalTrace }> = ({ source }) => {
  const label = source.source === 'libraries' ? 'Shared libraries' : 'Documents';
  const kept = source.finalEvidence ?? [];
  const maxScore = Math.max(0, ...kept.map(entry => entry.score));
  return (
    <div className="mt-1.5 space-y-0.5">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="tabular-nums">
          pool {source.hybrid.poolSize} → kept {source.finalSize}
        </span>
      </div>
      {source.finalEvidence === undefined && (
        <p className="text-muted-foreground text-xs">
          Final evidence was not recorded for this older response.
        </p>
      )}
      {kept.map((entry, index) => (
        <SnippetRow
          key={`${entry.sourceRef}-${entry.chunkIndex}`}
          rank={index + 1}
          citationId={entry.citationId}
          refLabel={entry.sourceRef}
          preview={entry.preview}
          score={entry.score}
          maxScore={maxScore}
          location={locationOf(entry)}
          via={entry.via}
          viaKind={entry.viaKind}
        />
      ))}
    </div>
  );
};
