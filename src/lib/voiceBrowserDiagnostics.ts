import { normalizeVoiceError } from '@/lib/voiceLifecycle';

import {
  VoiceDiagnosticKind as Kind,
  VoiceDiagnosticStage as Stage,
  VOICE_ERROR_NAMES,
  type VoiceBrowserDiagnosticRequest,
  type VoiceBrowserEvent,
  type VoiceBrowserSignal,
} from '@/types/voiceDiagnostics';

interface DiagnosticOptions {
  publish: (body: VoiceBrowserDiagnosticRequest) => Promise<void>;
  breadcrumb: (event: VoiceBrowserEvent, attemptId: string) => void;
}

/** Best effort, bounded, memory-only evidence. Never delays or changes a session outcome. */
export class VoiceBrowserDiagnostics {
  private readonly attemptId = crypto.randomUUID();
  private readonly started = performance.now();
  private stage: VoiceBrowserEvent['stage'] = Stage.Microphone;
  private events: VoiceBrowserEvent[] = [];
  private conversationId?: string;
  private sequence = 0;
  private revision = 0;
  private sentRevision = 0;
  private sending = false;
  private failures = 0;
  private finished = false;
  private disposed = false;
  private timer?: ReturnType<typeof setTimeout>;
  private expiry?: ReturnType<typeof setTimeout>;
  private removeTrackListeners = () => {};
  private observedTrack?: MediaStreamTrack;

  constructor(private readonly options: DiagnosticOptions) {
    window.addEventListener('offline', this.offline);
    window.addEventListener('online', this.online);
  }

  private offline = () => this.record({ kind: Kind.Offline });
  private online = () => {
    if (!this.finished) this.record({ kind: Kind.Online });
    void this.flush();
  };

  setStage(stage: VoiceBrowserEvent['stage']) {
    this.stage = stage;
  }

  link(conversationId: string) {
    if (this.disposed) return;
    this.conversationId = conversationId;
    this.revision++;
    this.schedule();
  }

  record(signal: VoiceBrowserSignal) {
    if (this.finished || this.disposed) return;
    const event: VoiceBrowserEvent = {
      ...signal,
      sequence: this.sequence++,
      elapsedMs: Math.min(86400000, Math.round(performance.now() - this.started)),
      stage: this.stage,
      online: navigator.onLine,
    };
    this.events = [...this.events, event].slice(-64);
    this.revision++;
    this.options.breadcrumb(event, this.attemptId);
    this.schedule();
  }

  error(error: unknown) {
    const name = normalizeVoiceError(error).name;
    const errorName = VOICE_ERROR_NAMES.find(value => value === name) ?? 'OtherError';
    this.record({
      kind: this.stage === Stage.Microphone ? Kind.MicrophoneError : Kind.StartFailed,
      errorName,
    });
  }

  watchMicrophone(stream: MediaStream) {
    const track = stream.getAudioTracks()[0];
    if (!track || this.finished) return;
    if (track === this.observedTrack) return;
    this.removeTrackListeners();
    this.observedTrack = track;
    const muted = () => this.record({ kind: Kind.MicrophoneMuted });
    const unmuted = () => this.record({ kind: Kind.MicrophoneUnmuted });
    const ended = () => this.record({ kind: Kind.MicrophoneEnded });
    track.addEventListener('mute', muted);
    track.addEventListener('unmute', unmuted);
    track.addEventListener('ended', ended);
    this.removeTrackListeners = () => {
      track.removeEventListener('mute', muted);
      track.removeEventListener('unmute', unmuted);
      track.removeEventListener('ended', ended);
    };
    this.record({ kind: Kind.MicrophoneReady });
    if (track.muted) muted();
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.removeTrackListeners();
    window.removeEventListener('offline', this.offline);
    // Retry after connectivity returns, while this document is alive. No disk storage.
    this.expiry = setTimeout(() => this.dispose(), 120000);
    void this.flush();
  }

  private schedule(delay = 250) {
    if (this.disposed) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), delay);
  }

  async flush() {
    if (this.disposed || this.sending || !navigator.onLine || !this.events.length) return;
    if (this.revision === this.sentRevision) {
      return;
    }
    this.sending = true;
    const revision = this.revision;
    try {
      await this.options.publish({
        attemptId: this.attemptId,
        conversationId: this.conversationId,
        events: [...this.events],
      });
      this.sentRevision = revision;
      this.failures = 0;
    } catch {
      // A failed diagnostic upload must not replace the original error or spam Sentry.
      if (++this.failures <= 3) this.schedule(10000);
      return;
    } finally {
      this.sending = false;
    }
    if (this.revision !== this.sentRevision) this.schedule();
  }

  private dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
    clearTimeout(this.expiry);
    this.removeTrackListeners();
    window.removeEventListener('offline', this.offline);
    window.removeEventListener('online', this.online);
  }
}
