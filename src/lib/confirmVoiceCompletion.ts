/** A runtime acknowledgement confirms receipt, not persistence in Socratic Bots. */
export async function confirmVoiceCompletion(
  readStatus: () => Promise<{ status: string }>,
  isCurrent: () => boolean,
  pause: () => Promise<void> = () => new Promise(resolve => setTimeout(resolve, 1000))
): Promise<void> {
  for (let attempt = 0; attempt < 6; attempt++) {
    if (!isCurrent()) throw new DOMException('Attempt changed', 'AbortError');
    const result = await readStatus();
    if (!isCurrent()) throw new DOMException('Attempt changed', 'AbortError');
    if (result.status === 'completed') return;
    if (result.status === 'failed' || result.status === 'cancelled')
      throw new Error(
        'This session was interrupted, not submitted as completed. Please check your attempt before retrying.'
      );
    await pause();
  }
  throw new Error(
    'Your session has ended, but submission is not yet confirmed. Check your conversation history before retrying.'
  );
}
