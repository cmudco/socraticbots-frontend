export type PipecatVoiceStatus =
  | 'disconnected'
  | 'connecting'
  | 'runtimeReady'
  | 'active'
  | 'disconnecting';

export type PipecatEndControlType = 'end' | 'cancel';

export interface PipecatVoiceMessage {
  type?: string;
  role?: 'user' | 'agent';
  message?: string;
  content?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  turnId?: number;
  isFinal?: boolean;
  reason?: string;
  error?: string;
  fatal?: boolean;
  isFatal?: boolean;
  sourceWavName?: string;
  webrtcWavName?: string;
  sourceSampleRate?: number;
  webrtcSampleRate?: number;
}

export const isPipecatRuntimeReadyMessage = (message: PipecatVoiceMessage): boolean =>
  message.type === 'runtime_ready' || message.type === 'agent_audio_started';

export const isPipecatActiveMessage = (message: PipecatVoiceMessage): boolean =>
  message.type === 'agent_audio_started';
