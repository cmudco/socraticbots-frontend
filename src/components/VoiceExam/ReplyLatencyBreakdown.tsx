/**
 * Compact examiner reply-latency line for the voice exam session panel.
 *
 * Degrades gracefully with whatever data exists:
 * - pending:            "Examiner is thinking…" / "Preparing voice…"
 * - total only:         "Reply 1.8s"
 * - total + breakdown:  "Reply 1.8s · LLM 1.1s · Voice 0.4s · Other 0.3s"
 *
 * Never invents numbers — segments render only when a real value is provided.
 */
import { REPLY_PENDING_LABELS, ReplyPendingStage } from '@/constants/voiceExam';

import { cn } from '@/lib/utils';

import { ThinkingDots } from '@/components/VoiceExam/indicators';

interface ReplyLatencyBreakdownProps {
  totalReplySeconds?: number | null;
  llmSeconds?: number | null;
  ttsSeconds?: number | null;
  otherSeconds?: number | null;
  /** Set while the examiner reply is in flight; takes precedence over metrics. */
  pendingStage?: ReplyPendingStage | null;
  className?: string;
}

const formatSeconds = (seconds: number): string => `${seconds.toFixed(1)}s`;

export function ReplyLatencyBreakdown({
  totalReplySeconds,
  llmSeconds,
  ttsSeconds,
  otherSeconds,
  pendingStage,
  className,
}: ReplyLatencyBreakdownProps) {
  if (pendingStage) {
    return (
      <p
        className={cn(
          'text-muted-foreground animate-in fade-in flex items-center gap-1.5 text-[11px] duration-300',
          className
        )}
      >
        <ThinkingDots dotClassName="h-1 w-1" />
        {REPLY_PENDING_LABELS[pendingStage]}
      </p>
    );
  }

  if (totalReplySeconds == null) return null;

  const segments: { label: string; seconds: number }[] = [
    { label: 'Reply', seconds: totalReplySeconds },
    ...(llmSeconds != null ? [{ label: 'LLM', seconds: llmSeconds }] : []),
    ...(ttsSeconds != null ? [{ label: 'Voice', seconds: ttsSeconds }] : []),
    ...(otherSeconds != null ? [{ label: 'Other', seconds: otherSeconds }] : []),
  ];

  return (
    <p
      className={cn(
        'text-muted-foreground animate-in fade-in flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[11px] duration-300',
        className
      )}
    >
      {segments.map((segment, index) => (
        <span key={segment.label} className="flex items-baseline gap-1">
          {index > 0 && <span aria-hidden="true">·</span>}
          <span>{segment.label}</span>
          <span className="text-foreground/80 font-medium tabular-nums">
            {formatSeconds(segment.seconds)}
          </span>
        </span>
      ))}
    </p>
  );
}

export default ReplyLatencyBreakdown;
