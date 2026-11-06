// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PushToTalkControl from '@/components/VoiceExam/PushToTalkControl';

const setup = (capturing = false, notice: string | null = null) => {
  const onToggle = vi.fn();
  render(<PushToTalkControl capturing={capturing} notice={notice} onToggle={onToggle} />);
  return onToggle;
};

afterEach(cleanup);

describe('PushToTalkControl', () => {
  it('toggles on click', () => {
    const onToggle = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('toggles once when Space is pressed and held', () => {
    const onToggle = setup();
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyDown(window, { code: 'Space', repeat: true });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('ignores Space typed in a field or an open dropdown', () => {
    const onToggle = setup();
    const input = document.body.appendChild(document.createElement('input'));
    const option = document.body.appendChild(document.createElement('div'));
    option.setAttribute('role', 'option');
    fireEvent.keyDown(input, { code: 'Space' });
    fireEvent.keyDown(option, { code: 'Space' });
    input.remove();
    option.remove();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('shows why nothing happened after an empty turn', () => {
    setup(false, "Didn't catch that — press Talk and try again.");
    expect(screen.getByText("Didn't catch that — press Talk and try again.")).toBeTruthy();
  });

  it('offers to send the answer while capturing', () => {
    setup(true);
    expect(screen.getByRole('button', { name: 'Done — send my answer' })).toBeTruthy();
  });
});
