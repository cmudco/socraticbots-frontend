/** Expected browser decisions are not service exceptions. Never infer user intent. */
import { ApiRequestError } from '@/utils/baseRequest';

export function isExpectedVoiceError(error: unknown): boolean {
  if (
    error instanceof ApiRequestError &&
    ['session_starting', 'session_active', 'attempt_limit_reached'].includes(error.code ?? '')
  )
    return true;
  return ['NotAllowedError', 'AbortError'].includes(normalizeVoiceError(error).name);
}

export function voiceErrorMessage(error: unknown): string {
  const normalized = normalizeVoiceError(error);
  if (normalized.name === 'NotAllowedError')
    return 'Microphone access is needed. Allow access in your browser and system settings, then retry.';
  if (normalized.name === 'NotFoundError')
    return 'No microphone was found. Connect a microphone, then retry.';
  if (normalized.name === 'NotReadableError')
    return 'Your microphone could not be opened. Check whether another app is using it, then retry.';
  return normalized.message;
}

/** DOMException is not instanceof Error in every browser/realm. Preserve its name. */
export function normalizeVoiceError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    'message' in error &&
    typeof error.name === 'string' &&
    typeof error.message === 'string'
  ) {
    const normalized = new Error(error.message);
    normalized.name = error.name;
    return normalized;
  }
  return new Error('Could not start your session. Please retry.');
}

export type ConnectionQuality = 'checking' | 'stable' | 'unstable' | 'lost';

export const CONNECTION_QUALITY_COPY: Record<ConnectionQuality, string> = {
  checking: 'Checking connection',
  stable: 'Connection stable',
  unstable: 'Connection unstable — audio may be delayed',
  lost: 'Connection lost — waiting to reconnect',
};

/** Windowed audio loss/jitter and reported uplink RTT. Missing stats and silence are not failure. */
export class VoiceConnectionMonitor {
  private previous = new Map<string, { received: number; lost: number }>();
  private remoteMeasurements = new Map<string, number>();
  private healthyWindows = 0;
  private badWindows = 0;
  quality: ConnectionQuality = 'checking';

  sample(report: RTCStatsReport): ConnectionQuality {
    let measured = false;
    let bad = false;
    const next = new Map<string, { received: number; lost: number }>();
    report.forEach(stat => {
      if (stat.type === 'remote-inbound-rtp' && (stat.kind ?? stat.mediaType) === 'audio') {
        const measurements = Number(stat.roundTripTimeMeasurements);
        const previous = this.remoteMeasurements.get(stat.id) ?? 0;
        if (Number.isFinite(measurements) && measurements > previous) {
          this.remoteMeasurements.set(stat.id, measurements);
          measured = true;
          bad ||= Number(stat.fractionLost) >= 0.05 || Number(stat.roundTripTime) >= 0.5;
        }
        return;
      }
      if (stat.type !== 'inbound-rtp' || (stat.kind ?? stat.mediaType) !== 'audio') return;
      const received = Number(stat.packetsReceived);
      const lost = Number(stat.packetsLost);
      if (!Number.isFinite(received) || !Number.isFinite(lost)) return;
      next.set(stat.id, { received, lost });
      const prev = this.previous.get(stat.id);
      if (!prev || received < prev.received || lost < prev.lost) return;
      const total = received - prev.received + lost - prev.lost;
      if (total < 20) return; // DTX/silence and sparse samples stay unknown.
      measured = true;
      bad ||= (lost - prev.lost) / total >= 0.05 || Number(stat.jitter) >= 0.1;
    });
    this.previous = next;
    if (!measured) return this.quality;
    this.badWindows = bad ? this.badWindows + 1 : 0;
    this.healthyWindows = bad ? 0 : this.healthyWindows + 1;
    if (this.badWindows >= 2) this.quality = 'unstable';
    if (this.healthyWindows >= 3) this.quality = 'stable';
    return this.quality;
  }
}
