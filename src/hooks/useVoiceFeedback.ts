import { useCallback, useState } from 'react';

import { isVoiceStage } from '@/constants/voiceStages';

import { PipecatVoiceMessage, SttProvider, VoiceStage } from '@/types/pipecat';

interface VoiceFeedback {
  stage: VoiceStage | null;
  sequence: number;
  provider: SttProvider;
  backupAvailable: boolean;
}
const initial: VoiceFeedback = {
  stage: null,
  sequence: 0,
  provider: 'mistral',
  backupAvailable: false,
};

export const reduceVoiceFeedback = (
  state: VoiceFeedback,
  message: PipecatVoiceMessage
): VoiceFeedback => {
  if (message.type === 'runtime_ready') {
    return {
      ...state,
      provider: message.sttProvider ?? state.provider,
      backupAvailable: message.sttFallbackAvailable === true,
    };
  }
  if (message.type === 'stt_status' || message.type === 'lab_stt') {
    if (message.event === 'fallback_started') return { ...state, provider: 'whisper' };
    if (message.event === 'fallback_reverted') return { ...state, provider: 'mistral' };
  }
  if (message.type === 'stt_switch_ack' && message.accepted === true) {
    return { ...state, provider: 'whisper' };
  }
  if (
    message.type === 'voice_stage' &&
    isVoiceStage(message.voiceStage) &&
    Number.isSafeInteger(message.sequence) &&
    message.sequence! > state.sequence
  ) {
    return { ...state, stage: message.voiceStage, sequence: message.sequence! };
  }
  return state;
};

export const useVoiceFeedback = () => {
  const [feedback, setFeedback] = useState(initial);
  const receive = useCallback(
    (message: PipecatVoiceMessage) => setFeedback(state => reduceVoiceFeedback(state, message)),
    []
  );
  const reset = useCallback(() => setFeedback(initial), []);
  return { ...feedback, receive, reset };
};
