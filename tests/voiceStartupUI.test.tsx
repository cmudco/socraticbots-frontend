// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import VoiceInterface from '@/components/VoiceExam/VoiceInterface';

import { VoiceAgent, VoiceProvider } from '@/types/voiceAgent';

const mocks = vi.hoisted(() => ({
  signed: vi.fn(),
  cancel: vi.fn(),
  end: vi.fn(),
  start: vi.fn(),
  status: 'disconnected',
  refresh: vi.fn(),
  report: vi.fn(),
  sessionStatus: vi.fn(),
  unmount: undefined as (() => Promise<void>) | undefined,
}));
vi.mock('@/services/voiceAgent.service', () => ({
  voiceAgentService: {
    reportBrowserDiagnostics: mocks.report,
    getSessionStatus: mocks.sessionStatus,
  },
}));
vi.mock('@/lib/sentry', () => ({ captureVoiceError: vi.fn(), recordVoiceEvent: vi.fn() }));
vi.mock('@elevenlabs/react', () => ({ useConversation: () => ({ status: 'disconnected' }) }));
vi.mock('@/hooks/queries/useVoiceAgents', () => ({
  useGetSignedUrl: () => ({ mutateAsync: mocks.signed, isPending: false }),
  useCancelConversation: () => ({ mutateAsync: mocks.cancel }),
  useStartConversation: () => ({ mutate: vi.fn() }),
  useEndConversation: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('@/hooks/useMicrophoneDevices', () => ({
  useMicrophoneDevices: () => ({ selectedId: '', refresh: mocks.refresh }),
}));
vi.mock('@/components/VoiceExam/MicrophoneSelect', () => ({ default: () => null }));
vi.mock('@/hooks/usePipecatWebRTCSession', () => ({
  usePipecatWebRTCSession: (options: { onUnmount: () => Promise<void> }) => {
    mocks.unmount = options.onUnmount;
    return {
      status: mocks.status,
      connectionQuality: 'checking',
      startSession: mocks.start,
      endSession: mocks.end,
      requestSttFallback: vi.fn(),
      sendControlMessage: vi.fn(),
      switchAudioDevice: vi.fn(),
    };
  },
}));

const agent = {
  id: 1,
  name: 'Test exam',
  voiceProvider: VoiceProvider.MistralVoice,
  maxDurationSeconds: 600,
  permissions: {},
} as VoiceAgent;

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.stubGlobal('localStorage', { getItem: () => 'test-token' });
  mocks.report.mockResolvedValue(undefined);
  mocks.sessionStatus.mockResolvedValue({ status: 'completed' });
  mocks.status = 'disconnected';
  mocks.signed.mockResolvedValue({
    provider: VoiceProvider.MistralVoice,
    sessionId: 'test',
    token: 'test',
    webrtcUrl: 'http://runtime.test',
  });
  mocks.cancel.mockResolvedValue({});
  mocks.end.mockResolvedValue(true);
  mocks.start.mockImplementation(() => {
    mocks.status = 'connecting';
    return new Promise(() => {});
  });
  Element.prototype.scrollIntoView = vi.fn();
  const track = Object.assign(new EventTarget(), { stop: vi.fn(), muted: false });
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi
        .fn()
        .mockResolvedValue({ getTracks: () => [track], getAudioTracks: () => [track] }),
    },
  });
});
afterEach(async () => {
  cleanup();
  await vi.advanceTimersByTimeAsync(120001);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('startup UI', () => {
  it('shows ending feedback immediately and waits for persisted completion', async () => {
    const complete = vi.fn();
    let acknowledge!: (value: boolean) => void;
    let persist!: (value: { status: string }) => void;
    mocks.end.mockImplementation(
      () =>
        new Promise(resolve => {
          acknowledge = resolve;
        })
    );
    mocks.sessionStatus.mockImplementation(
      () =>
        new Promise(resolve => {
          persist = resolve;
        })
    );
    mocks.start.mockImplementation(async () => {
      mocks.status = 'active';
    });
    render(<VoiceInterface agent={agent} onComplete={complete} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Start' })));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'End session' })));
    expect(screen.getByRole('status').textContent).toContain('Ending your session');
    expect(screen.queryByRole('button', { name: 'End session' })).toBeNull();
    expect(complete).not.toHaveBeenCalled();
    await act(async () => acknowledge(true));
    expect(complete).not.toHaveBeenCalled();
    await act(async () => persist({ status: 'completed' }));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(mocks.end).toHaveBeenCalledTimes(1);
  });

  it('removes the ending screen and shows an error if saving cannot be confirmed', async () => {
    const complete = vi.fn();
    mocks.start.mockImplementation(async () => {
      mocks.status = 'active';
    });
    mocks.sessionStatus.mockRejectedValue(new Error('Submission could not be confirmed'));
    render(<VoiceInterface agent={agent} onComplete={complete} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Start' })));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'End session' })));
    expect(screen.queryByText('Ending your session…')).toBeNull();
    expect(screen.getByText('Submission could not be confirmed')).toBeTruthy();
    expect(complete).not.toHaveBeenCalled();
  });

  it('navigation cancels the current attempt without submitting or showing completion', async () => {
    const complete = vi.fn();
    mocks.start.mockResolvedValue(undefined);
    render(<VoiceInterface agent={agent} onComplete={complete} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Start' })));
    await act(async () => mocks.unmount?.());
    expect(mocks.end).toHaveBeenCalledWith('route_change', 'cancel');
    expect(mocks.cancel).toHaveBeenCalledWith({
      agentId: 1,
      conversationId: 'test',
      endedReason: 'route_change',
    });
    expect(complete).not.toHaveBeenCalled();
  });

  it('does not reserve an attempt when microphone access is dismissed', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(
      new DOMException('dismissed', 'NotAllowedError')
    );
    render(<VoiceInterface agent={agent} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Start' })));
    expect(mocks.signed).not.toHaveBeenCalled();
    expect(screen.getByText(/Microphone access is needed/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(mocks.report).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        conversationId: undefined,
        events: [
          expect.objectContaining({
            kind: 'microphone_error',
            errorName: 'NotAllowedError',
            stage: 'microphone',
          }),
        ],
      })
    );
  });

  it('the connecting Cancel button never submits or opens completion', async () => {
    const complete = vi.fn();
    const view = render(<VoiceInterface agent={agent} onComplete={complete} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Start' })));
    view.rerender(<VoiceInterface agent={agent} onComplete={complete} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Cancel' })));
    expect(mocks.end).toHaveBeenCalledWith('startup_cancelled', 'cancel');
    expect(mocks.cancel).toHaveBeenCalledWith({
      agentId: 1,
      conversationId: 'test',
      endedReason: 'startup_cancelled',
    });
    expect(complete).not.toHaveBeenCalled();
  });
});
