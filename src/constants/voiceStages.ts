import { VoiceStage } from '@/types/pipecat';

export const VOICE_STAGE_COPY: Record<VoiceStage, { label: string; caption: string }> = {
  listening: { label: 'Your turn', caption: 'I’m listening. Take your time.' },
  transcribing: { label: 'Recognizing your words', caption: 'Turning your speech into text.' },
  thinking: { label: 'Thinking about your answer', caption: 'The agent is preparing a response.' },
  preparing_voice: {
    label: 'Preparing the agent’s voice',
    caption: 'The response is being converted to audio.',
  },
  speaking: {
    label: 'Agent’s turn',
    caption: 'The agent is speaking. You can interrupt to add something.',
  },
  recovering: {
    label: 'Recovering speech recognition',
    caption: 'Please stay here while recognition reconnects or switches to backup.',
  },
};

export const isVoiceStage = (value: unknown): value is VoiceStage =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(VOICE_STAGE_COPY, value);
