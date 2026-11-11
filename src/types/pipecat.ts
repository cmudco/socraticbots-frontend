import { VoiceTurnMode } from '@/types/voiceAgent';

export type PipecatVoiceStatus =
  | 'disconnected'
  | 'connecting'
  | 'runtimeReady'
  | 'active'
  | 'disconnecting';

export type PipecatEndControlType = 'end' | 'cancel';

export type PipecatProcessingStage = 'llm' | 'tts';
export type SttProvider = 'mistral' | 'whisper';
export type VoiceStage =
  | 'listening'
  | 'transcribing'
  | 'thinking'
  | 'preparing_voice'
  | 'speaking'
  | 'recovering';

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
  timeInCallSecs?: number;
  isFinal?: boolean;
  // On agent_audio_started: per-turn latency metrics. Not emitted by the
  // runtime yet; when absent the UI shows only the client-measured reply time.
  llmLatencySeconds?: number;
  ttsLatencySeconds?: number;
  totalLatencySeconds?: number;
  reason?: string;
  requestId?: string;
  accepted?: boolean;
  provider?: SttProvider;
  sttProvider?: SttProvider;
  sttFallbackAvailable?: boolean;
  voiceStage?: VoiceStage;
  sequence?: number;
  recognitionMs?: number;
  audioSeconds?: number;
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
  turnMode?: VoiceTurnMode;
  // On ptt_state: whether the runtime is capturing the student's answer.
  capturing?: boolean;
}

export const isPipecatRuntimeReadyMessage = (message: PipecatVoiceMessage): boolean =>
  message.type === 'runtime_ready' || message.type === 'agent_audio_started';

export const isPipecatActiveMessage = (message: PipecatVoiceMessage): boolean =>
  message.type === 'agent_audio_started';
