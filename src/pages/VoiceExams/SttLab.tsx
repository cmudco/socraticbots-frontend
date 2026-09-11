import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { speechRecoveryCaption } from '@/constants/voiceRecovery';
import { Loader2, Mic, Square } from 'lucide-react';

import { useLocalMicLevel } from '@/hooks/useLocalMicLevel';
import { useMicrophoneDevices } from '@/hooks/useMicrophoneDevices';
import { usePipecatWebRTCSession } from '@/hooks/usePipecatWebRTCSession';
import { useVoiceFeedback } from '@/hooks/useVoiceFeedback';

import { voiceAgentService } from '@/services/voiceAgent.service';

import BackupSpeechControl from '@/components/VoiceExam/BackupSpeechControl';
import { LevelMeter } from '@/components/VoiceExam/LevelMeter';
import MicrophoneSelect from '@/components/VoiceExam/MicrophoneSelect';
import { Button } from '@/components/ui/button';

import { PipecatVoiceMessage, SttProvider } from '@/types/pipecat';

/**
 * STT Lab — isolated mic → runtime → Voxtral test bench.
 *
 * When someone reports gibberish / wrong-language / missing transcriptions,
 * this page removes every other variable: no exam, no LLM, no TTS. Pick a
 * microphone, connect, talk. Side-by-side meters show what the browser
 * captures vs. what the server hears; the transcript pane streams interims
 * and finals with detected language + latency; the console shows every
 * runtime event and error, none swallowed.
 */

interface LabMessage extends PipecatVoiceMessage {
  peak?: number;
  rms?: number;
  vadVolume?: number;
  gateMinVolume?: number;
  speaking?: boolean;
  language?: string | null;
  latencyMs?: number | null;
  sttModel?: string;
}

interface ConsoleEntry {
  at: string;
  kind: 'info' | 'vad' | 'stt' | 'error' | 'transcript';
  text: string;
}

interface LabTurn {
  turnId: number;
  text: string;
  isFinal: boolean;
  language?: string | null;
  latencyMs?: number | null;
}

interface ServerLevels {
  peak: number;
  rms: number;
  vadVolume: number;
  gateMinVolume: number;
}

const MAX_CONSOLE_ENTRIES = 400;

const now = () => new Date().toLocaleTimeString(undefined, { hour12: false });

const SttLab = () => {
  const { receive: receiveFeedback, reset: resetFeedback, ...feedback } = useVoiceFeedback();
  const [selectedProvider, setSelectedProvider] = useState<SttProvider>('mistral');
  const [recognitionMs, setRecognitionMs] = useState<number | null>(null);
  const [recoveryCaption, setRecoveryCaption] = useState<string | null>(null);
  // The lab exists to be pointed at a microphone, so asking for access up
  // front (and getting readable device names) is the whole point here.
  const mic = useMicrophoneDevices({ probeOnMount: true });
  const { selectedId, permission } = mic;
  const [serverLevels, setServerLevels] = useState<ServerLevels | null>(null);
  const [labConfig, setLabConfig] = useState<LabMessage | null>(null);
  const [vadSpeaking, setVadSpeaking] = useState(false);
  const [turns, setTurns] = useState<LabTurn[]>([]);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);
  /** Device the live session is capturing from; null when not connected. */
  const activeDeviceIdRef = useRef<string | null>(null);

  const log = useCallback((kind: ConsoleEntry['kind'], text: string) => {
    setConsoleEntries(previous =>
      [...previous, { at: now(), kind, text }].slice(-MAX_CONSOLE_ENTRIES)
    );
  }, []);

  const handleMessage = useCallback(
    (raw: PipecatVoiceMessage) => {
      receiveFeedback(raw);
      if (raw.recognitionMs != null) setRecognitionMs(raw.recognitionMs);
      const message = raw as LabMessage;
      switch (message.type) {
        case 'lab_config':
          setLabConfig(message);
          log('info', `config: ${JSON.stringify({ ...message, type: undefined })}`);
          break;
        case 'lab_levels':
          setServerLevels({
            peak: Number(message.peak ?? 0),
            rms: Number(message.rms ?? 0),
            vadVolume: Number(message.vadVolume ?? 0),
            gateMinVolume: Number(message.gateMinVolume ?? 0.35),
          });
          break;
        case 'lab_vad':
          setVadSpeaking(Boolean(message.speaking));
          log('vad', message.speaking ? 'voice detected — turn open' : 'silence — turn closed');
          break;
        case 'lab_stt': {
          setRecoveryCaption(speechRecoveryCaption(message.event));
          const { event, ...rest } = message;
          delete rest.type;
          log('stt', `${String(event)} ${JSON.stringify(rest)}`);
          break;
        }
        case 'lab_error':
        case 'error':
          log('error', String(message.error ?? 'unknown error'));
          break;
        case 'transcript_update': {
          const turnId = Number(message.turnId ?? 0);
          const turn: LabTurn = {
            turnId,
            text: String(message.message ?? ''),
            isFinal: Boolean(message.isFinal),
            language: (message.language as string | null | undefined) ?? null,
            latencyMs: (message.latencyMs as number | null | undefined) ?? null,
          };
          setTurns(previous => {
            const next = previous.filter(existing => existing.turnId !== turnId);
            next.push(turn);
            return next.sort((a, b) => a.turnId - b.turnId);
          });
          if (turn.isFinal) {
            log(
              'transcript',
              `turn ${turnId} FINAL (${turn.language ?? 'lang?'}${
                turn.latencyMs != null ? `, ${turn.latencyMs}ms` : ''
              }): ${turn.text}`
            );
          }
          break;
        }
        default:
          break;
      }
    },
    [log, receiveFeedback]
  );

  const { status, startSession, endSession, switchAudioDevice, requestSttFallback } =
    usePipecatWebRTCSession({
      onMessage: handleMessage,
      onError: error => log('error', error.message),
      onDisconnect: () => log('info', 'session disconnected'),
      playRuntimeTtsAudio: false,
    });

  const live = status === 'runtimeReady' || status === 'active';
  const localLevel = useLocalMicLevel(selectedId, permission === 'granted');

  const connect = useCallback(async () => {
    resetFeedback();
    setRecognitionMs(null);
    setRecoveryCaption(null);
    setStarting(true);
    setStartError(null);
    setTurns([]);
    setServerLevels(null);
    log('info', 'requesting lab session…');
    try {
      const session = await voiceAgentService.startSttLabSession();
      if (!session.webrtcUrl || !session.token) {
        throw new Error('Lab session response is missing webrtcUrl/token');
      }
      log('info', `lab session ${session.sessionId ?? '?'} — connecting`);
      activeDeviceIdRef.current = selectedId;
      await startSession({
        webrtcUrl: session.webrtcUrl,
        token: session.token,
        iceServers: session.iceServers,
        audioDeviceId: selectedId || undefined,
        sttProvider: selectedProvider,
      });
      log('info', 'connected — speak whenever you like');
    } catch (error) {
      activeDeviceIdRef.current = null;
      const messageText = error instanceof Error ? error.message : 'Failed to start lab session';
      setStartError(messageText);
      log('error', messageText);
    } finally {
      setStarting(false);
    }
  }, [log, selectedId, selectedProvider, resetFeedback, startSession]);

  const disconnect = useCallback(() => {
    activeDeviceIdRef.current = null;
    void endSession('manual_end');
  }, [endSession]);

  // Swapping microphones mid-run is how you A/B two of them against the same
  // meters, so the lab hot-swaps instead of forcing a reconnect.
  useEffect(() => {
    if (!live) return;
    const previousDeviceId = activeDeviceIdRef.current;
    if (previousDeviceId === null || previousDeviceId === selectedId) return;
    activeDeviceIdRef.current = selectedId;
    void (async () => {
      try {
        await switchAudioDevice(selectedId || undefined);
        log('info', `microphone switched to ${selectedId || 'system default'}`);
      } catch (error) {
        activeDeviceIdRef.current = previousDeviceId;
        mic.selectDevice(previousDeviceId);
        log('error', `microphone switch failed: ${(error as Error).message}`);
      }
    })();
  }, [live, log, mic, selectedId, switchAudioDevice]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleEntries]);

  const statusLabel = useMemo(() => {
    if (starting || status === 'connecting') return 'Connecting…';
    if (live) return vadSpeaking ? 'Hearing you' : 'Listening';
    return 'Not connected';
  }, [live, starting, status, vadSpeaking]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Speech-to-Text Lab</h1>
        <p className="text-muted-foreground text-sm">
          Isolated mic → runtime → Mistral or self-hosted Whisper. No assignment, no AI agent — just
          your voice and the transcription engine, with every level, event, and error visible.
        </p>
        <details className="bg-card rounded-lg border">
          <summary className="cursor-pointer px-4 py-2 text-sm font-medium">
            How to read this page
          </summary>
          <div className="text-muted-foreground space-y-2 border-t px-4 py-3 text-sm">
            <p>
              <b className="text-foreground">Numbers:</b> <b>loudest</b> is the strongest instant in
              the last second (0–1; near 1.0 means clipping). <b>average</b> is overall loudness —
              quiet rooms sit near 0.00x, normal speech around 0.02–0.1. <b>speech</b> is loudness
              the way the voice detector measures it, and <b>gate</b> (the red line) is the cutoff:
              speech quieter than the gate is deliberately ignored.
            </p>
            <p>
              <b className="text-foreground">Diagnosing in one glance:</b> if the left meter stays
              flat while you talk → microphone or browser permission. Left moves but right stays
              flat → audio is lost in transit (network/WebRTC). Both move, speech stays under the
              red line → too quiet for voice detection. Both healthy but no transcript → the
              transcription provider — watch the console for{' '}
              <span className="font-mono text-xs">stalled / rebuild / recovered</span> events and
              copy them into the bug report.
            </p>
            <p>
              <b className="text-foreground">Transcript chips:</b> <b>language</b> is what Voxtral
              believes it heard (wrong language = that turn's text is suspect); the <b>ms value</b>{' '}
              measures Mistral’s final text after you stopped talking. For Whisper it measures batch
              queueing to final text; recovery before queueing is not included.
            </p>
          </div>
        </details>
      </header>

      <section className="bg-card flex flex-wrap items-end gap-4 rounded-xl border p-4">
        <label className="flex flex-col gap-1 text-sm">
          Recognition provider
          <select
            className="bg-background rounded border p-2"
            value={selectedProvider}
            disabled={starting || live}
            onChange={event =>
              setSelectedProvider(event.target.value === 'whisper' ? 'whisper' : 'mistral')
            }
          >
            <option value="mistral">Mistral realtime</option>
            <option value="whisper">Self-hosted Whisper (after each pause)</option>
          </select>
        </label>
        {live ? (
          <div className="space-y-2">
            <p className="text-sm">
              Selected engine: {feedback.provider === 'whisper' ? 'Whisper' : 'Mistral'}
            </p>
            {recognitionMs !== null ? (
              <p className="text-sm">
                Last backup request: {recognitionMs} ms (request to result; excludes queue wait)
              </p>
            ) : null}
            <BackupSpeechControl
              available={feedback.backupAvailable}
              provider={feedback.provider}
              onSwitch={requestSttFallback}
            />
          </div>
        ) : null}
        <MicrophoneSelect
          mic={mic}
          disabled={starting}
          hint={
            live
              ? 'Switching mid-run swaps the mic without dropping the session.'
              : 'Plug in a headset and the lab switches to it for you.'
          }
          className="min-w-64 flex-1"
        />
        {live ? (
          <Button variant="destructive" onClick={disconnect}>
            <Square className="size-4" /> Stop session
          </Button>
        ) : (
          <Button onClick={connect} disabled={starting || permission !== 'granted'}>
            {starting ? <Loader2 className="size-4 animate-spin" /> : <Mic className="size-4" />}
            {starting ? 'Starting…' : 'Start lab session'}
          </Button>
        )}
        <div
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            live
              ? vadSpeaking
                ? 'bg-emerald-500/15 text-emerald-600'
                : 'bg-sky-500/15 text-sky-600'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {statusLabel}
        </div>
      </section>

      {startError && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
          {startError}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="bg-card flex flex-col gap-4 rounded-xl border p-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase">Your browser hears</h2>
          <LevelMeter
            label="Mic level"
            value={localLevel.peak}
            detail={`loudest ${localLevel.peak.toFixed(3)} · average ${localLevel.rms.toFixed(4)}`}
          />
          <p className="text-muted-foreground text-xs">
            Live from the selected microphone, before anything is sent. If this stays flat while you
            talk, the problem is the mic or browser permissions — not our servers.
          </p>
          {recoveryCaption ? (
            <p role="status" className="text-sm">
              {recoveryCaption}
            </p>
          ) : null}
        </div>
        <div className="bg-card flex flex-col gap-4 rounded-xl border p-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase">The server hears</h2>
          {serverLevels ? (
            <LevelMeter
              label="Speech volume vs. gate"
              value={serverLevels.vadVolume}
              gate={serverLevels.gateMinVolume}
              detail={`speech ${serverLevels.vadVolume.toFixed(2)} · loudest ${serverLevels.peak.toFixed(3)} · gate ${serverLevels.gateMinVolume}`}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              {live ? 'Waiting for the first level report…' : 'Connect to see server-side levels.'}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            Measured by the runtime on the audio it actually received. Speech under the red gate
            line is ignored by voice detection. Comparing the two panels isolates network/WebRTC
            loss from mic problems.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="bg-card flex h-96 flex-col rounded-xl border">
          <div className="flex items-center justify-between border-b p-3">
            <h2 className="text-sm font-semibold tracking-wide uppercase">Live transcript</h2>
            {labConfig != null && (
              <span className="text-muted-foreground font-mono text-xs">
                {feedback.provider === 'whisper'
                  ? 'Self-hosted Whisper'
                  : String(labConfig.sttModel ?? '')}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {turns.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Say something — interim words stream in gray, finals turn solid with the detected
                language and turn latency.
              </p>
            )}
            {turns.map(turn => (
              <div key={turn.turnId} className="flex flex-col gap-1">
                <div className="text-muted-foreground flex gap-2 font-mono text-[11px]">
                  <span>turn {turn.turnId}</span>
                  {turn.isFinal && (
                    <span title="Language Voxtral believes it heard — if this is not your language, that turn's text is suspect">
                      language: {turn.language ?? 'auto (not reported)'}
                    </span>
                  )}
                  {turn.isFinal && turn.latencyMs != null && (
                    <span title="Time from when you stopped talking to the final text">
                      {turn.latencyMs}ms
                    </span>
                  )}
                </div>
                <p className={turn.isFinal ? 'text-sm' : 'text-muted-foreground text-sm italic'}>
                  {turn.text || '…'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card flex h-96 flex-col rounded-xl border">
          <div className="flex items-center justify-between border-b p-3">
            <h2 className="text-sm font-semibold tracking-wide uppercase">Runtime console</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  void navigator.clipboard.writeText(
                    consoleEntries
                      .map(entry => `${entry.at} [${entry.kind}] ${entry.text}`)
                      .join('\n')
                  )
                }
              >
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConsoleEntries([])}>
                Clear
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-5">
            {consoleEntries.length === 0 && (
              <p className="text-muted-foreground">
                Every runtime event lands here: VAD activity, STT socket lifecycle (request ids,
                stalls, rebuilds, recoveries), levels config, and all errors.
              </p>
            )}
            {consoleEntries.map((entry, index) => (
              <div
                key={`${entry.at}-${index}`}
                className={
                  entry.kind === 'error'
                    ? 'text-red-500'
                    : entry.kind === 'stt'
                      ? 'text-amber-600'
                      : entry.kind === 'vad'
                        ? 'text-sky-600'
                        : entry.kind === 'transcript'
                          ? 'text-emerald-600'
                          : 'text-muted-foreground'
                }
              >
                {entry.at} [{entry.kind}] {entry.text}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SttLab;
