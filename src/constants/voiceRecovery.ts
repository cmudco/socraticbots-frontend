export const SpeechRecoveryEvent = {
  STALLED: 'stalled',
  RECOVERED: 'recovered',
  FAILED: 'failed',
  FALLBACK_STARTED: 'fallback_started',
  FALLBACK_PROCESSING: 'fallback_processing',
  FALLBACK_RECOVERED: 'fallback_recovered',
  FALLBACK_FAILED: 'fallback_failed',
} as const;

export const SpeechRecoveryMessageType = 'stt_status';

export const speechRecoveryCaption = (event?: string): string | null => {
  switch (event) {
    case SpeechRecoveryEvent.STALLED:
      return 'Reconnecting speech recognition — keeping your answer.';
    case SpeechRecoveryEvent.FALLBACK_STARTED:
    case SpeechRecoveryEvent.FALLBACK_PROCESSING:
      return 'Backup speech recognition is processing your answer. This may take a little longer.';
    default:
      return null;
  }
};
