// @vitest-environment jsdom
import { SpeechRecoveryEvent, speechRecoveryCaption } from '@/constants/voiceRecovery';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePipecatWebRTCSession } from '@/hooks/usePipecatWebRTCSession';
import { reduceVoiceFeedback } from '@/hooks/useVoiceFeedback';

import { PipecatVoiceMessage } from '@/types/pipecat';

vi.mock('@/lib/sentry', () => ({ captureVoiceError: vi.fn(), tagVoiceSession: vi.fn() }));

class Channel {
  readyState = 'open';
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn();
  receive(message: PipecatVoiceMessage) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
}

class Peer {
  static latest: Peer;
  channel = new Channel();
  connectionState = 'connected';
  iceGatheringState = 'complete';
  localDescription = { sdp: 'test', type: 'offer' };
  onconnectionstatechange: (() => void) | null = null;
  constructor() {
    Peer.latest = this;
  }
  addTransceiver = vi.fn();
  createDataChannel = () => this.channel;
  createOffer = async () => this.localDescription;
  setLocalDescription = vi.fn();
  setRemoteDescription = async () => {
    this.channel.onopen?.();
    this.channel.receive({ type: 'runtime_ready', ttsTransport: 'webrtc' });
  };
  close = vi.fn();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('RTCPeerConnection', Peer);
  vi.stubGlobal(
    'MediaStream',
    class {
      addTrack = vi.fn();
    }
  );
  vi.stubGlobal(
    'Audio',
    class {
      pause = vi.fn();
      play = async () => {};
    }
  );
  const track = { stop: vi.fn() };
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: async () => ({ getAudioTracks: () => [track], getTracks: () => [track] }),
    },
  });
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => ({ sdp: 'test', type: 'answer' }) }))
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function start(options = {}) {
  const hook = renderHook(() => usePipecatWebRTCSession(options));
  await act(async () => {
    await hook.result.current.startSession({
      webrtcUrl: 'http://localhost/sessions/test/webrtc/offer',
      token: 'local-test',
    });
  });
  return hook;
}

describe('voice session recovery and ending', () => {
  it('switches only after the matching backup acknowledgement', async () => {
    const hook = await start();
    Peer.latest.channel.send.mockImplementation((raw: string) => {
      const message = JSON.parse(raw);
      if (message.type === 'stt_switch')
        Peer.latest.channel.receive({
          type: 'stt_switch_ack',
          requestId: message.requestId,
          accepted: true,
        });
    });
    expect(await hook.result.current.requestSttFallback()).toBe(true);
    expect(hook.result.current.status).toBe('runtimeReady');
  });

  it('times out wrong backup acknowledgements without claiming success', async () => {
    const hook = await start();
    const switching = hook.result.current.requestSttFallback();
    Peer.latest.channel.receive({ type: 'stt_switch_ack', requestId: 'wrong', accepted: true });
    await vi.advanceTimersByTimeAsync(8000);
    expect(await switching).toBe(false);
  });

  it('resolves a pending switch on cleanup and rejects a closed channel', async () => {
    const hook = await start();
    const switching = hook.result.current.requestSttFallback();
    hook.unmount();
    expect(await switching).toBe(false);
    expect(await hook.result.current.requestSttFallback()).toBe(false);
  });

  it('sends the lab provider in the offer', async () => {
    const hook = renderHook(() => usePipecatWebRTCSession({}));
    await act(async () =>
      hook.result.current.startSession({
        webrtcUrl: 'http://localhost/sessions/lab/webrtc/offer',
        token: 'test',
        sttProvider: 'whisper',
      })
    );
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).sttProvider).toBe(
      'whisper'
    );
  });

  it('ignores stale or invalid stages and distinguishes selection from successful recognition', () => {
    const state = { stage: null, sequence: 0, provider: 'mistral' as const, backupAvailable: true };
    const next = reduceVoiceFeedback(state, {
      type: 'voice_stage',
      voiceStage: 'thinking',
      sequence: 2,
    });
    expect(next.stage).toBe('thinking');
    expect(
      reduceVoiceFeedback(next, { type: 'voice_stage', voiceStage: 'listening', sequence: 1 })
    ).toBe(next);
    expect(reduceVoiceFeedback(next, { type: 'stt_switch_ack', accepted: false })).toBe(next);
    expect(reduceVoiceFeedback(next, { type: 'stt_switch_ack', accepted: true }).provider).toBe(
      'whisper'
    );
  });
  it('ends only after a matching acknowledgement', async () => {
    const hook = await start();
    Peer.latest.channel.send.mockImplementation((raw: string) => {
      const message = JSON.parse(raw);
      if (message.type === 'end')
        Peer.latest.channel.receive({ type: 'session_end_ack', requestId: message.requestId });
    });
    let confirmed = false;
    await act(async () => {
      confirmed = await hook.result.current.endSession('manual_end');
    });
    expect(confirmed).toBe(true);
    expect(hook.result.current.status).toBe('disconnected');
  });

  it('ignores the wrong acknowledgement and reports an unconfirmed end', async () => {
    const onMessage = vi.fn();
    const hook = await start({ onMessage });
    let ending: Promise<boolean>;
    await act(async () => {
      ending = hook.result.current.endSession('manual_end');
      Peer.latest.channel.receive({ type: 'session_end_ack', requestId: 'wrong' });
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(await ending!).toBe(false);
    expect(onMessage).toHaveBeenCalledWith({ type: 'end_unconfirmed' });
  });

  it('survives a transient disconnect but reports a sustained one', async () => {
    const onDisconnect = vi.fn();
    await start({ onDisconnect });
    await act(async () => {
      Peer.latest.connectionState = 'disconnected';
      Peer.latest.onconnectionstatechange?.();
      await vi.advanceTimersByTimeAsync(4000);
      Peer.latest.connectionState = 'connected';
      Peer.latest.onconnectionstatechange?.();
      await vi.advanceTimersByTimeAsync(8000);
    });
    expect(onDisconnect).not.toHaveBeenCalled();
    await act(async () => {
      Peer.latest.connectionState = 'disconnected';
      Peer.latest.onconnectionstatechange?.();
      await vi.advanceTimersByTimeAsync(8000);
    });
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it('forwards fallback status without terminating a healthy connection', async () => {
    const onMessage = vi.fn();
    const hook = await start({ onMessage });
    act(() => Peer.latest.channel.receive({ type: 'stt_status', event: 'fallback_started' }));
    expect(hook.result.current.status).toBe('runtimeReady');
    expect(onMessage).toHaveBeenCalledWith({ type: 'stt_status', event: 'fallback_started' });
    expect(speechRecoveryCaption(SpeechRecoveryEvent.FALLBACK_STARTED)).toContain('Backup');
    expect(speechRecoveryCaption(SpeechRecoveryEvent.FALLBACK_RECOVERED)).toBeNull();
  });

  it('records page exit without claiming to know whether the tab was closed or refreshed', async () => {
    await start();
    act(() => window.dispatchEvent(new Event('pagehide')));
    expect(Peer.latest.channel.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'client_exit', reason: 'page_hidden_exit' })
    );
  });
});
