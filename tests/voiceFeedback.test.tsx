// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import BackupSpeechControl from '@/components/VoiceExam/BackupSpeechControl';

afterEach(cleanup);

describe('backup recognition control', () => {
  it('does not offer an unavailable backup', () => {
    render(<BackupSpeechControl available={false} provider="mistral" onSwitch={vi.fn()} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows pending then an unconfirmed switch without claiming recovery', async () => {
    let finish!: (accepted: boolean) => void;
    const onSwitch = vi.fn(
      () =>
        new Promise<boolean>(resolve => {
          finish = resolve;
        })
    );
    render(<BackupSpeechControl available provider="mistral" onSwitch={onSwitch} />);
    fireEvent.click(screen.getByRole('button'));
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('button').textContent).toContain('Switching');
    await act(async () => finish(false));
    expect(screen.getByRole('alert').textContent).toContain('wasn’t confirmed');
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });

  it('describes selected Whisper as selection, not proof of recovered text', () => {
    render(<BackupSpeechControl available provider="whisper" onSwitch={vi.fn()} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('selected');
    expect(screen.getByRole('status').textContent).toContain('Pause');
  });
});
