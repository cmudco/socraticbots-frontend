import { describe, expect, it } from 'vitest';

import {
  VoiceConnectionMonitor,
  isExpectedVoiceError,
  voiceErrorMessage,
} from '@/lib/voiceLifecycle';

const report = (received: number, lost = 0, jitter = 0.01) =>
  new Map([
    [
      'a',
      {
        id: 'a',
        type: 'inbound-rtp',
        kind: 'audio',
        packetsReceived: received,
        packetsLost: lost,
        jitter,
      },
    ],
  ]) as unknown as RTCStatsReport;

describe('connection quality', () => {
  it('requires sustained samples and does not infer failure from silence', () => {
    const monitor = new VoiceConnectionMonitor();
    expect(monitor.sample(report(0))).toBe('checking');
    expect(monitor.sample(report(0))).toBe('checking');
    monitor.sample(report(100));
    monitor.sample(report(200));
    expect(monitor.sample(report(300))).toBe('stable');
    expect(monitor.sample(report(300))).toBe('stable');
    expect(monitor.sample(report(400, 20))).toBe('stable');
    expect(monitor.sample(report(500, 40))).toBe('unstable');
    monitor.sample(report(600, 40));
    monitor.sample(report(700, 40));
    expect(monitor.sample(report(800, 40))).toBe('stable');
  });
  it('ignores unavailable stats and counter resets', () => {
    const monitor = new VoiceConnectionMonitor();
    monitor.sample(report(100));
    expect(monitor.sample(report(0))).toBe('checking');
    expect(monitor.sample(new Map() as unknown as RTCStatsReport)).toBe('checking');
  });
  it('keeps permission decisions separate from service exceptions', () => {
    const permission = new DOMException('Permission dismissed', 'NotAllowedError');
    expect(isExpectedVoiceError(permission)).toBe(true);
    expect(voiceErrorMessage(permission)).toContain('Allow access');
    expect(isExpectedVoiceError(new Error('Transport failed'))).toBe(false);
  });
});
