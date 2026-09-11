import ContextTraceChip from '@/components/chat/toolActivity/ContextTraceChip';
import ToolActivity from '@/components/chat/toolActivity/ToolActivity';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import type { ContextTrace } from '@/types/contextTrace';
import { type MessageDiagnostics, retrievalTraces } from '@/types/messageDetails';
import type { ChatToolCall } from '@/types/toolCalls';

import RetrievalTracePanel from './RetrievalTracePanel';

interface DetailsMessage extends MessageDiagnostics {
  date: string;
  cost?: string | number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
}
interface MessageDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: DetailsMessage;
  contextTrace?: ContextTrace;
  toolCalls?: ChatToolCall[];
}

const formatCount = (value?: number | null) =>
  value == null ? 'Not recorded' : value.toLocaleString();
const safeSourceUrl = (value: string) => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};

export default function MessageDetailsSheet({
  open,
  onOpenChange,
  message,
  contextTrace,
  toolCalls,
}: MessageDetailsSheetProps) {
  const traces = retrievalTraces(message.retrievalTrace);
  const cost = message.cost == null ? null : Number(message.cost);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>Message details</SheetTitle>
          <SheetDescription>
            Recorded context, sources and usage for this response.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          <section aria-label="Usage" className="space-y-3">
            <h3 className="text-sm font-semibold">Usage</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Input tokens</dt>
              <dd>{formatCount(message.inputTokens)}</dd>
              <dt className="text-muted-foreground">Output tokens</dt>
              <dd>{formatCount(message.outputTokens)}</dd>
              <dt className="text-muted-foreground">Cost</dt>
              <dd>
                {cost != null && Number.isFinite(cost)
                  ? `$${cost.toFixed(8).replace(/0+$/, '').replace(/\.$/, '.00')}`
                  : 'Not recorded'}
              </dd>
              <dt className="text-muted-foreground">Model</dt>
              <dd className="break-words">
                {message.litellmModelName ??
                  (message.llm != null ? `Model ${message.llm}` : 'Not recorded')}
              </dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(message.date).toLocaleString()}</dd>
            </dl>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Context assembly</h3>
            {contextTrace ? (
              <ContextTraceChip trace={contextTrace} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Context details were not recorded for this response.
              </p>
            )}
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Document retrieval</h3>
            {traces.length ? (
              traces.map((trace, index) => <RetrievalTracePanel key={index} trace={trace} />)
            ) : (
              <p className="text-muted-foreground text-sm">
                No retrieval-stage trace was recorded. Classic retrieval and older responses may
                only have snippets.
              </p>
            )}
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">
              Retrieved snippets {message.snippets?.length ? `(${message.snippets.length})` : ''}
            </h3>
            {message.snippets?.length ? (
              message.snippets.map(snippet => (
                <details key={snippet.id} className="rounded-lg border p-3 text-sm">
                  <summary className="cursor-pointer font-medium">
                    {snippet.file?.name || snippet.sourceRef || snippet.library?.name || 'Document'}{' '}
                    · chunk {snippet.chunkIndex + 1}
                  </summary>
                  <p className="mt-2 break-words whitespace-pre-wrap">{snippet.text}</p>
                  {snippet.similarityScore != null && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      Relevance score: {Number(snippet.similarityScore).toFixed(3)} · not a
                      probability of correctness
                    </p>
                  )}
                </details>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No snippets were recorded for this response.
              </p>
            )}
          </section>
          {!!toolCalls?.length && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Tool activity</h3>
              <ToolActivity toolCalls={toolCalls} />
            </section>
          )}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Web sources</h3>
            {message.webSearchSources?.length ? (
              message.webSearchSources.map(source => (
                <div key={source.id} className="rounded-lg border p-3 text-sm">
                  {safeSourceUrl(source.url) ? (
                    <a
                      className="text-primary break-words underline"
                      href={safeSourceUrl(source.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.title || source.url}
                    </a>
                  ) : (
                    <span>{source.title || 'Source'}</span>
                  )}
                  {source.citedText && (
                    <p className="mt-2 whitespace-pre-wrap">{source.citedText}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No web sources were recorded for this response.
              </p>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
