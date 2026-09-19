// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import SessionOutcome from '@/components/VoiceExam/SessionOutcome';

afterEach(cleanup);

it('shows the ending reason without browser debugging details', () => {
  render(<SessionOutcome reason="route_change" activity="conversation" />);
  expect(screen.getByText('Ending: Left the exam page')).toBeTruthy();
  expect(screen.getByText('Activity: User transcript activity recorded')).toBeTruthy();
  expect(screen.queryByText(/Browser evidence/i)).toBeNull();
});

it('renders nothing when there is no outcome information', () => {
  const { container } = render(<SessionOutcome />);
  expect(container.textContent).toBe('');
});
