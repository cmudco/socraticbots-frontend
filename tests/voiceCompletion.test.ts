import { describe, expect, it, vi } from 'vitest';

import { confirmVoiceCompletion } from '@/lib/confirmVoiceCompletion';

describe('persisted completion', () => {
  it('waits for persistence instead of treating runtime acknowledgment as submission', async () => {
    const read = vi
      .fn()
      .mockResolvedValueOnce({ status: 'in_progress' })
      .mockResolvedValueOnce({ status: 'completed' });
    await confirmVoiceCompletion(
      read,
      () => true,
      async () => {}
    );
    expect(read).toHaveBeenCalledTimes(2);
  });
  it('does not claim success for cancellation, failed persistence, or a changed attempt', async () => {
    await expect(
      confirmVoiceCompletion(
        async () => ({ status: 'cancelled' }),
        () => true
      )
    ).rejects.toThrow('interrupted');
    await expect(
      confirmVoiceCompletion(
        async () => ({ status: 'in_progress' }),
        () => true,
        async () => {}
      )
    ).rejects.toThrow('not yet confirmed');
    await expect(
      confirmVoiceCompletion(
        async () => ({ status: 'completed' }),
        () => false
      )
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
