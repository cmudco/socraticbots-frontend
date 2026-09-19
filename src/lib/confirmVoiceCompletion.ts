import { ConversationStatus, type VoiceSessionStatusResponse } from '@/types/voiceAgent';

/** A runtime acknowledgement confirms receipt, not persistence in Socratic Bots. */
export async function confirmVoiceCompletion(
  readStatus: () => Promise<Pick<VoiceSessionStatusResponse, 'status'>>,
  isCurrent: () => boolean,
  pause: () => Promise<void> = () => new Promise(resolve => setTimeout(resolve, 1000))
): Promise<void> {
  for (let attempt = 0; attempt < 6; attempt++) {
    if (!isCurrent()) throw new DOMException('Attempt changed', 'AbortError');
    const result = await readStatus();
    if (!isCurrent()) throw new DOMException('Attempt changed', 'AbortError');
    if (result.status === ConversationStatus.Completed) return;
    if (
      result.status === ConversationStatus.Failed ||
      result.status === ConversationStatus.Cancelled
    )
      throw new Error(
        'This session was interrupted, not submitted as completed. Please check your attempt before retrying.'
      );
    await pause();
  }
  throw new Error(
    'Your session has ended, but submission is not yet confirmed. Check your conversation history before retrying.'
  );
}
