import React from 'react';

import { CornerDownRight, Search, ShieldCheck, Shuffle, Split, Trophy } from 'lucide-react';

import { RetrievalTrace, hopVerb } from '@/types/messageDetails';

import EntryRow from './RetrievalEntryRow';
import { SourceSnippets } from './SnippetList';
import { StepHeader } from './StepHeader';
import { TimelineStep } from './Timeline';

interface RetrievalTraceStagesProps {
  trace: RetrievalTrace;
}

const fmtScore = (score: number): string =>
  Math.abs(score) < 1 ? score.toFixed(3) : score.toFixed(2);

const RetrievalTraceStages: React.FC<RetrievalTraceStagesProps> = ({ trace }) => {
  if (!trace) return null;

  // Build the list of stages that actually ran, so the timeline rail only
  // draws nodes (and connectors) for present stages.
  const steps: {
    key: string;
    icon: React.ReactNode;
    content: React.ReactNode;
  }[] = [];

  if (trace.queryAnalysis) {
    steps.push({
      key: 'query-analysis',
      icon: <Search className="h-3.5 w-3.5" />,
      content: (
        <>
          <StepHeader title="Query analysis" />
          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium">
              {trace.queryAnalysis.intent}
            </span>
            {trace.queryAnalysis.keywords.map(kw => (
              <span
                key={kw}
                className="bg-muted text-muted-foreground max-w-full rounded px-1.5 py-0.5 font-mono text-xs break-all"
              >
                {kw}
              </span>
            ))}
          </div>
          {trace.queryAnalysis.rewrittenQuery && (
            <div className="mt-2">
              <div className="text-muted-foreground text-xs font-medium">Rewritten query</div>
              <p className="text-foreground mt-0.5 max-w-full text-xs [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                {trace.queryAnalysis.rewrittenQuery}
              </p>
            </div>
          )}
          {trace.queryAnalysis.hydePassage && (
            <div className="mt-2">
              <div className="text-muted-foreground text-xs font-medium">
                Hypothetical answer · HyDE
              </div>
              <p className="border-border bg-muted/50 text-muted-foreground mt-0.5 max-w-full rounded border-l-2 px-2 py-1 text-xs [overflow-wrap:anywhere] break-words whitespace-pre-wrap italic">
                {trace.queryAnalysis.hydePassage}
              </p>
            </div>
          )}
        </>
      ),
    });
  }

  steps.push({
    key: 'hybrid',
    icon: <Shuffle className="h-3.5 w-3.5" />,
    content: (
      <>
        <StepHeader title="Hybrid retrieve">
          <span className="text-muted-foreground font-normal">
            · BM25 + dense + RRF · {trace.hybrid.poolSize} candidates
          </span>
        </StepHeader>
        <div className="mt-1 min-w-0 overflow-hidden">
          {trace.hybrid.topCandidates.map(e => (
            <EntryRow key={`h-${e.rank}`} entry={e} />
          ))}
        </div>
      </>
    ),
  });

  if (trace.expand?.applied) {
    steps.push({
      key: 'expand',
      icon: <CornerDownRight className="h-3.5 w-3.5" />,
      content: (
        <>
          <StepHeader title="Graph expand">
            <span className="text-muted-foreground font-normal">
              {trace.expand.added.length === 0
                ? '· nothing added'
                : `· added ${trace.expand.added.length} linked ${
                    trace.expand.added.length === 1 ? 'chunk' : 'chunks'
                  }`}
            </span>
          </StepHeader>
          {trace.expand.added.length > 0 && (
            <div className="mt-1 min-w-0 overflow-hidden">
              {trace.expand.added.map(e => {
                const locationParts = [
                  e.pageNo != null ? `p. ${e.pageNo}` : '',
                  e.section ?? '',
                  e.via ? `${hopVerb(e.viaKind)} "${e.via}"` : '',
                ].filter(Boolean);
                const locationLine = locationParts.join(' · ');

                return (
                  <div key={`x-${e.sourceRef}-${e.chunkIndex}`}>
                    <EntryRow entry={e} />
                    {locationLine && (
                      <div className="text-muted-foreground pl-4 text-[11px]">{locationLine}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ),
    });
  }

  if (trace.rerank.applied && trace.rerank.results.length > 0) {
    steps.push({
      key: 'rerank',
      icon: <Trophy className="h-3.5 w-3.5" />,
      content: (
        <>
          <StepHeader title="Rerank">
            <span className="text-muted-foreground font-normal">· cross-encoder re-scored</span>
          </StepHeader>
          <div className="mt-1 min-w-0 overflow-hidden">
            {trace.rerank.results.map(e => (
              <EntryRow key={`r-${e.rank}`} entry={e} showMove />
            ))}
          </div>
        </>
      ),
    });
  }

  steps.push({
    key: 'mmr',
    icon: <Split className="h-3.5 w-3.5" />,
    content: (
      <StepHeader title="MMR">
        <span className="text-muted-foreground font-normal">· {trace.mmr.reason}</span>
      </StepHeader>
    ),
  });

  if (trace.grounding) {
    steps.push({
      key: 'grounding',
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      content: (
        <StepHeader title="Retrieval confidence">
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
              trace.grounding.answerFound
                ? 'bg-muted text-emerald-600 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {trace.grounding.answerFound ? 'higher relevance' : 'low relevance'}
          </span>
          <span className="text-muted-foreground font-mono font-normal [overflow-wrap:anywhere] break-words">
            top {fmtScore(trace.grounding.topScore)} / {trace.grounding.threshold} threshold
          </span>
        </StepHeader>
      ),
    });
  }

  steps.push({
    key: 'final-evidence',
    icon: <Search className="h-3.5 w-3.5" />,
    content: (
      <>
        <StepHeader title="Evidence sent to the model" />
        <SourceSnippets source={trace} />
      </>
    ),
  });

  return (
    <div className="min-w-0 overflow-hidden">
      {steps.map((step, i) => (
        <TimelineStep key={step.key} icon={step.icon} isLast={i === steps.length - 1}>
          {step.content}
        </TimelineStep>
      ))}
    </div>
  );
};

export default RetrievalTraceStages;
