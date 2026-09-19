// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { voiceBrowserEventSchema } from '@/lib/voiceApiContract';

import BrowserEvidence from '@/components/VoiceExam/BrowserEvidence';

import contract from './fixtures/voiceApiContract.json';

afterEach(cleanup);

it('shows microphone error and stage without claiming a physical mute', () => {
  render(<BrowserEvidence events={[voiceBrowserEventSchema.parse(contract.browserEvent)]} />);
  expect(screen.getByText(/Microphone could not be opened/).textContent).toContain(
    'NotAllowedError'
  );
  expect(screen.getByText(/Microphone could not be opened/).textContent).toContain('microphone');
  expect(screen.getByText(/not a proven cause/)).toBeTruthy();
});

it('does not invent evidence for older records', () => {
  render(<BrowserEvidence events={[]} />);
  expect(screen.getByText('Browser evidence: not received.')).toBeTruthy();
});

it('expands inside a history card without navigating away', () => {
  const navigate = vi.fn();
  render(
    <div onClick={navigate}>
      <BrowserEvidence events={[voiceBrowserEventSchema.parse(contract.browserEvent)]} />
    </div>
  );
  fireEvent.click(screen.getByText('Browser evidence (1 signals)'));
  expect(navigate).not.toHaveBeenCalled();
});
