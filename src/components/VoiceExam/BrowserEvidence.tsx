import { formatTimeInCall } from '@/utils/formatters';

import { VoiceDiagnosticKind as Kind, type VoiceBrowserEvent } from '@/types/voiceDiagnostics';

interface BrowserEvidenceProps {
  events: VoiceBrowserEvent[];
}

const LABELS = {
  [Kind.Offline]: 'Browser reported offline',
  [Kind.Online]: 'Browser reported online',
  [Kind.MicrophoneReady]: 'Microphone access granted',
  [Kind.MicrophoneError]: 'Microphone could not be opened',
  [Kind.MicrophoneMuted]: 'Microphone track temporarily stopped providing media',
  [Kind.MicrophoneUnmuted]: 'Microphone track resumed providing media',
  [Kind.MicrophoneEnded]: 'Microphone track ended',
  [Kind.PeerState]: 'Voice connection state changed',
  [Kind.StartFailed]: 'Startup failed',
  [Kind.ClientEnd]: 'Client stopped this attempt',
};

export default function BrowserEvidence({ events }: BrowserEvidenceProps) {
  if (!events.length) return <p>Browser evidence: not received.</p>;
  return (
    <details>
      <summary className="cursor-pointer" onClick={event => event.stopPropagation()}>
        Browser evidence ({events.length} signals)
      </summary>
      <p className="my-2">
        Times are since Start. Signals describe what the browser observed, not a proven cause.
      </p>
      <ul className="space-y-1">
        {events.map(event => (
          <li key={event.sequence}>
            {formatTimeInCall(event.elapsedMs / 1000)} · {event.stage} · {LABELS[event.kind]}
            {event.errorName ? ` (${event.errorName})` : ''}
            {event.peerState ? `: ${event.peerState}` : ''}
            {!event.online && event.kind !== Kind.Offline ? ' · Browser reported offline' : ''}
          </li>
        ))}
      </ul>
    </details>
  );
}
