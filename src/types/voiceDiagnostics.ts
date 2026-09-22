export const VoiceDiagnosticKind = {
  Offline: 'network_offline',
  Online: 'network_online',
  MicrophoneReady: 'microphone_ready',
  MicrophoneError: 'microphone_error',
  MicrophoneMuted: 'microphone_muted',
  MicrophoneUnmuted: 'microphone_unmuted',
  MicrophoneEnded: 'microphone_ended',
  PeerState: 'peer_state',
  StartFailed: 'start_failed',
  ClientEnd: 'client_end',
} as const;

export const VoiceDiagnosticStage = {
  Microphone: 'microphone',
  Reservation: 'reservation',
  Connection: 'connection',
  Active: 'active',
  Ending: 'ending',
} as const;

export const VOICE_ERROR_NAMES = [
  'NotAllowedError',
  'NotFoundError',
  'NotReadableError',
  'OverconstrainedError',
  'SecurityError',
  'AbortError',
  'TypeError',
  'Error',
  'OtherError',
] as const;

export interface VoiceBrowserSignal {
  kind: (typeof VoiceDiagnosticKind)[keyof typeof VoiceDiagnosticKind];
  errorName?: (typeof VOICE_ERROR_NAMES)[number];
  peerState?: RTCPeerConnectionState;
}

export interface VoiceBrowserEvent extends VoiceBrowserSignal {
  sequence: number;
  elapsedMs: number;
  stage: (typeof VoiceDiagnosticStage)[keyof typeof VoiceDiagnosticStage];
  online: boolean;
}

export interface VoiceBrowserDiagnosticRequest {
  attemptId: string;
  conversationId?: string;
  events: VoiceBrowserEvent[];
}
