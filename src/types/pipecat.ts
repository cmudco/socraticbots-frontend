export type PipecatVoiceStatus =
  | 'disconnected'
  | 'connecting'
  | 'runtimeReady'
  | 'active'
  | 'disconnecting';

export type PipecatEndControlType = 'end' | 'cancel';

export type PipecatProcessingStage = 'llm' | 'tts';

export interface PipecatVoiceMessage {
  type?: string;
  role?: 'user' | 'agent';
  message?: string;
  content?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  isProcessing?: boolean;
  // On processing: which pipeline phase the runtime is waiting on. Not emitted
  // by the runtime yet; the UI falls back to a generic "preparing" state.
  stage?: PipecatProcessingStage;
  turnId?: number;
  isFinal?: boolean;
  // On agent_audio_started: per-turn latency metrics. Not emitted by the
  // runtime yet; when absent the UI shows only the client-measured reply time.
  llmLatencySeconds?: number;
  ttsLatencySeconds?: number;
  totalLatencySeconds?: number;
  reason?: string;
  requestId?: string;
  state?: 'paused' | 'resuming';
  event?: string;
  error?: string;
  fatal?: boolean;
  isFatal?: boolean;
  /** RTVI-shaped errors nest the payload under `data`. */
  data?: { error?: string; fatal?: boolean };
  sourceWavName?: string;
  webrtcWavName?: string;
  sourceSampleRate?: number;
  webrtcSampleRate?: number;
  // On runtime_ready: "webrtc" = play the live WebRTC audio track (streaming),
  // "http" (or absent) = fetch pre-rendered WAVs. Default is HTTP.
  ttsTransport?: 'webrtc' | 'http';
}

export const isPipecatRuntimeReadyMessage = (message: PipecatVoiceMessage): boolean =>
  message.type === 'runtime_ready' || message.type === 'agent_audio_started';

export const isPipecatActiveMessage = (message: PipecatVoiceMessage): boolean =>
  message.type === 'agent_audio_started';
