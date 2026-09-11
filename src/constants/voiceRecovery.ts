export const SpeechRecoveryEvent = {
  STALLED: 'stalled',
  RECOVERED: 'recovered',
  FAILED: 'failed',
  FALLBACK_STARTED: 'fallback_started',
  FALLBACK_PROCESSING: 'fallback_processing',
  FALLBACK_RECOVERED: 'fallback_recovered',
  FALLBACK_FAILED: 'fallback_failed',
  FALLBACK_REVERTED: 'fallback_reverted',
} as const;

export const SpeechRecoveryMessageType = 'stt_status';

export const speechRecoveryLabel = (event?: string): string | null => {
  switch (event) {
    case SpeechRecoveryEvent.STALLED:
      return 'Recovering speech recognition';
    case SpeechRecoveryEvent.FALLBACK_STARTED:
      return 'Backup recognition selected';
    case SpeechRecoveryEvent.FALLBACK_PROCESSING:
      return 'Recognizing your words (backup)';
    default:
      return null;
  }
};

export const speechRecoveryCaption = (event?: string): string | null => {
  switch (event) {
    case SpeechRecoveryEvent.STALLED:
      return 'Reconnecting speech recognition — trying to recover your answer.';
    case SpeechRecoveryEvent.FALLBACK_STARTED:
      return 'Backup recognition is selected. Finish speaking and pause to transcribe.';
    case SpeechRecoveryEvent.FALLBACK_PROCESSING:
      return 'Backup speech recognition is processing your answer. This may take a little longer.';
    default:
      return null;
  }
};
