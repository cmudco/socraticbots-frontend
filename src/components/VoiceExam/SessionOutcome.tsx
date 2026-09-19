const REASONS: Record<string, string> = {
  manual_end: 'Ended using End session',
  time_limit: 'Time limit reached',
  route_change: 'Left the exam page',
  page_hidden_exit: 'Page exited — refresh or close cannot be distinguished',
  connection_failed: 'Connection failed',
  connection_disconnected: 'Connection disconnected',
  connection_not_established: 'Connection was not established',
  start_failed: 'Could not start the exam',
  startup_failed: 'Startup could not be confirmed',
  startup_cancelled: 'Cancelled while connecting',
  runtime_failure: 'Voice runtime failed',
  startup_replaced: 'Unstarted attempt replaced by a retry',
  reserved_session_expired: 'Startup reservation expired',
  stale_in_progress_expired: 'Session expired without a confirmed ending',
  unknown_disconnect: 'Disconnected — exact cause unknown',
};
const ACTIVITY: Record<string, string> = {
  never_connected: 'Never connected',
  connected_no_transcript: 'Connected; no transcript recorded',
  greeting_only: 'Agent transcript only; no user transcript recorded',
  conversation: 'User transcript activity recorded',
};

export default function SessionOutcome({
  reason,
  activity,
}: {
  reason?: string | null;
  activity?: string | null;
}) {
  if (!reason && !activity) return null;
  return (
    <div className="text-muted-foreground mt-3 space-y-1 text-sm">
      {reason && <p>Ending: {REASONS[reason] ?? 'Ended — exact cause not classified'}</p>}
      {activity && ACTIVITY[activity] && <p>Activity: {ACTIVITY[activity]}</p>}
    </div>
  );
}
