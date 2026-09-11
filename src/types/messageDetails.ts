/** Multiple traces on one message — one per retrieval source. */
export interface RetrievalTraceEnvelope {
  traces: RetrievalTrace[];
}

/** Normalize a message's trace payload to a list of traces. */
export const retrievalTraces = (
  payload: RetrievalTrace | RetrievalTraceEnvelope | null | undefined
): RetrievalTrace[] => {
  if (!payload) return [];
  return 'traces' in payload ? payload.traces : [payload];
};

/** One chunk as it appeared at a single RAG pipeline stage. */
export interface RetrievalTraceEntry {
  citationId?: string | null;
  sourceRef: string;
  chunkIndex: number;
  score: number;
  rank: number;
  /** Rank at the previous stage, for showing rank movement (null if new/unranked). */
  prevRank: number | null;
  preview: string;
  /** Page and nearest heading of a document chunk; absent for libraries and older traces. */
  pageNo?: number | null;
  section?: string;
  /** Raw pointer text when the chunk was pulled in by the expand stage. */
  via?: string | null;
  /** How `via` was followed: 'entity' for a shared-entity hop, otherwise the pointer kind. */
  viaKind?: string | null;
}

/** Whether a hop followed a pointer or was pulled in through a shared entity. */
export const hopVerb = (viaKind?: string | null): 'shares' | 'followed' =>
  viaKind === 'entity' ? 'shares' : 'followed';

/** How an answer was retrieved, stage by stage (matches backend RetrievalTrace.to_payload). */
export interface RetrievalTrace {
  /** Which corpus this trace covers: 'documents' | 'libraries' (absent on older traces). */
  source?: string;
  query: string;
  queryAnalysis: {
    intent: string;
    keywords: string[];
    /** Cleaned, disambiguated restatement embedded for the dense leg. */
    rewrittenQuery?: string;
    /** HyDE: a hypothetical answer embedded instead of the bare question. */
    hydePassage?: string;
  } | null;
  hybrid: { poolSize: number; topCandidates: RetrievalTraceEntry[] };
  rerank: { applied: boolean; results: RetrievalTraceEntry[] };
  /** Graph expand stage: in-document references followed, and shared-entity links,
   *  one hop out (absent on older traces). */
  expand?: { applied: boolean; added: RetrievalTraceEntry[] };
  mmr: { applied: boolean; reason: string };
  grounding: {
    answerFound: boolean;
    topScore: number;
    threshold: number;
  } | null;
  finalSize: number;
  /** Exact post-budget evidence; absent on historical traces. */
  finalEvidence?: RetrievalTraceEntry[];
}

export interface MessageSnippet {
  id: number;
  file: { id: number; name: string } | null;
  library?: { id: number; name: string } | null;
  sourceRef?: string;
  text: string;
  similarityScore: number;
  chunkIndex: number;
}
export interface MessageWebSource {
  id: number;
  url: string;
  title: string;
  citedText?: string;
  provider?: string;
}
export interface MessageDiagnostics {
  snippets?: MessageSnippet[];
  webSearchSources?: MessageWebSource[];
  retrievalTrace?: RetrievalTrace | RetrievalTraceEnvelope | null;
  llm?: number | null;
  litellmModelName?: string | null;
}
