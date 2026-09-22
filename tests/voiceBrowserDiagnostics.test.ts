// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VoiceBrowserDiagnostics } from '@/lib/voiceBrowserDiagnostics';

import {
  VoiceDiagnosticKind as Kind,
  VoiceDiagnosticStage as Stage,
} from '@/types/voiceDiagnostics';

const attempts: VoiceBrowserDiagnostics[] = [];
const create = () => {
  const publish = vi.fn().mockResolvedValue(undefined);
  const breadcrumb = vi.fn();
  const attempt = new VoiceBrowserDiagnostics({ publish, breadcrumb });
  attempts.push(attempt);
  return { attempt, publish, breadcrumb };
};
const online = (value: boolean) => vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value);

beforeEach(() => {
  vi.useFakeTimers();
  online(true);
});
afterEach(async () => {
  attempts.splice(0).forEach(attempt => attempt.finish());
  await vi.advanceTimersByTimeAsync(120001);
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('browser diagnostic evidence', () => {
  it('keeps an offline signal until connectivity returns, even after the call ends', async () => {
    const { attempt, publish } = create();
    attempt.link('first-session');
    attempt.setStage(Stage.Active);
    online(false);
    window.dispatchEvent(new Event('offline'));
    attempt.finish();
    expect(publish).not.toHaveBeenCalled();
    online(true);
    window.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(1);
    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'first-session',
        events: [
          expect.objectContaining({
            kind: Kind.Offline,
            online: false,
            stage: Stage.Active,
          }),
        ],
      })
    );
  });

  it('records a permission error without audio, free text, or a reservation', async () => {
    const { attempt, publish, breadcrumb } = create();
    attempt.error(new DOMException('sensitive device name', 'NotAllowedError'));
    await attempt.flush();
    const body = publish.mock.calls[0][0];
    expect(body.conversationId).toBeUndefined();
    expect(body.events[0]).toMatchObject({
      kind: Kind.MicrophoneError,
      errorName: 'NotAllowedError',
      stage: Stage.Microphone,
    });
    expect(JSON.stringify(body)).not.toContain('sensitive');
    expect(breadcrumb).toHaveBeenCalledOnce();
  });

  it('links a reservation that arrives after the user cancelled startup', async () => {
    const { attempt, publish } = create();
    attempt.record({ kind: Kind.ClientEnd });
    attempt.finish();
    await vi.advanceTimersByTimeAsync(1);
    attempt.link('late-reservation');
    await vi.advanceTimersByTimeAsync(250);
    expect(publish.mock.lastCall?.[0].conversationId).toBe('late-reservation');
  });

  it('does not mix callbacks or network signals into an ended attempt', async () => {
    const first = create();
    first.attempt.record({ kind: Kind.MicrophoneReady });
    first.attempt.finish();
    const second = create();
    first.attempt.record({ kind: Kind.PeerState, peerState: 'failed' });
    online(false);
    window.dispatchEvent(new Event('offline'));
    expect(first.breadcrumb).toHaveBeenCalledTimes(1);
    expect(second.breadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ kind: Kind.Offline }),
      expect.any(String)
    );
  });

  it('retries failed delivery without rejecting or creating another session', async () => {
    const { attempt, publish } = create();
    publish.mockRejectedValueOnce(new Error('Network unavailable'));
    attempt.record({ kind: Kind.Offline });
    await expect(attempt.flush()).resolves.toBeUndefined();
    await vi.advanceTimersByTimeAsync(10000);
    expect(publish).toHaveBeenCalledTimes(2);
    expect(publish.mock.calls[0][0].attemptId).toBe(publish.mock.calls[1][0].attemptId);
  });

  it('bounds the buffer and drops it after the finished-attempt retry window', async () => {
    const { attempt, publish } = create();
    online(false);
    for (let i = 0; i < 100; i++) attempt.record({ kind: Kind.PeerState, peerState: 'connecting' });
    online(true);
    await attempt.flush();
    expect(publish.mock.lastCall?.[0].events).toHaveLength(64);
    attempt.finish();
    await vi.advanceTimersByTimeAsync(120001);
    const calls = publish.mock.calls.length;
    attempt.link('too-late');
    window.dispatchEvent(new Event('online'));
    expect(publish).toHaveBeenCalledTimes(calls);
  });

  it('observes actual microphone track events, not silence or an inferred physical mute', () => {
    const { attempt, breadcrumb } = create();
    const track = Object.assign(new EventTarget(), { muted: false });
    const stream = { getAudioTracks: () => [track] } as unknown as MediaStream;
    attempt.watchMicrophone(stream);
    attempt.watchMicrophone(stream);
    expect(breadcrumb).toHaveBeenCalledTimes(1);
    track.dispatchEvent(new Event('mute'));
    expect(breadcrumb.mock.lastCall?.[0].kind).toBe(Kind.MicrophoneMuted);
    attempt.finish();
    track.dispatchEvent(new Event('ended'));
    expect(breadcrumb).toHaveBeenCalledTimes(2);
  });
});
