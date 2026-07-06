import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Voice Lab — dev-only harness to test the STT and TTS layers in isolation,
 * independent of the exam pipeline. Talks directly to the voice runtime's
 * /lab/* endpoints (enable them with VOICE_RUNTIME_ENABLE_LAB=true).
 */

const LAB_BASE =
  (import.meta.env.VITE_VOICE_RUNTIME_URL as string | undefined) || 'http://localhost:8010';

type Tab = 'tts' | 'stt';

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

interface TtsResult {
  synthSeconds: string | null;
  audioSeconds: string | null;
  rtf: string | null;
  roundTripSeconds: string;
}

interface SttResult {
  text: string;
  provider: string;
  latencySeconds: number;
  firstTokenLatencySeconds?: number | null;
  model?: string;
  targetDelayMs?: number;
}

const TTS_SAMPLE =
  'Thank you. Recently, executives at Manzana have been made aware that hardware ' +
  'sales are declining. Do you understand the case, or would you like me to repeat it?';

const STT_SAMPLE_RATE = 16000;

function websocketUrl(path: string): string {
  const url = new URL(path, LAB_BASE);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function downsampleToPcm16(input: Float32Array, inputSampleRate: number): ArrayBuffer {
  const ratio = inputSampleRate / STT_SAMPLE_RATE;
  const outputLength = Math.max(1, Math.floor(input.length / ratio));
  const output = new Int16Array(outputLength);

  for (let i = 0; i < outputLength; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), input.length);
    let sum = 0;
    const count = Math.max(1, end - start);
    for (let j = start; j < end; j += 1) {
      sum += input[j];
    }
    const sample = Math.max(-1, Math.min(1, sum / count));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return output.buffer;
}

export default function VoiceLab() {
  const [tab, setTab] = useState<Tab>('tts');

  // ---- TTS state ----
  const [voices, setVoices] = useState<string[]>([]);
  const [voice, setVoice] = useState('af_heart');
  const [ttsText, setTtsText] = useState(TTS_SAMPLE);
  const [speed, setSpeed] = useState(1.0);
  const [ttsBusy, setTtsBusy] = useState(false);
  const [ttsResult, setTtsResult] = useState<TtsResult | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // ---- STT state ----
  const [provider, setProvider] = useState('voxtral-batch');
  const [recording, setRecording] = useState(false);
  const [sttBusy, setSttBusy] = useState(false);
  const [sttResult, setSttResult] = useState<SttResult | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const [livePartial, setLivePartial] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const sttWsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch(`${LAB_BASE}/lab/tts/voices`)
      .then(r => r.json())
      .then(d => setVoices(d?.engines?.kokoro ?? []))
      .catch(() => setVoices([]));
  }, []);

  const speak = useCallback(async () => {
    setTtsBusy(true);
    setTtsError(null);
    setTtsResult(null);
    try {
      const fd = new FormData();
      fd.append('text', ttsText);
      fd.append('voice', voice);
      fd.append('speed', String(speed));
      const t0 = performance.now();
      const r = await fetch(`${LAB_BASE}/lab/tts`, { method: 'POST', body: fd });
      if (!r.ok) throw new Error(`TTS failed (${r.status})`);
      const result: TtsResult = {
        synthSeconds: r.headers.get('X-Synth-Seconds'),
        audioSeconds: r.headers.get('X-Audio-Seconds'),
        rtf: r.headers.get('X-RTF'),
        roundTripSeconds: ((performance.now() - t0) / 1000).toFixed(2),
      };
      const url = URL.createObjectURL(await r.blob());
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        URL.revokeObjectURL(ttsAudioRef.current.src);
      }
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      void audio.play();
      setTtsResult(result);
    } catch (e) {
      setTtsError(e instanceof Error ? e.message : 'TTS error');
    } finally {
      setTtsBusy(false);
    }
  }, [ttsText, voice, speed]);

  const startRecording = useCallback(async () => {
    setSttError(null);
    setSttResult(null);
    setLivePartial('');
    setRecUrl(null);

    if (provider === 'mistral-realtime') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        const AudioContextCtor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
        if (!AudioContextCtor) throw new Error('Web Audio API is not available');
        const audioContext = new AudioContextCtor();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        const ws = new WebSocket(websocketUrl('/lab/stt/stream'));
        ws.binaryType = 'arraybuffer';

        const startedAt = performance.now();
        ws.onopen = () => {
          source.connect(processor);
          processor.connect(audioContext.destination);
          setRecording(true);
        };
        ws.onmessage = event => {
          const data = JSON.parse(event.data as string) as SttResult & {
            type?: 'partial' | 'final' | 'error';
            error?: string;
          };
          if (data.type === 'partial') {
            setLivePartial(data.text);
            setSttResult({
              text: data.text,
              provider: 'mistral-realtime',
              latencySeconds: Number(((performance.now() - startedAt) / 1000).toFixed(3)),
              firstTokenLatencySeconds: data.firstTokenLatencySeconds,
            });
          } else if (data.type === 'final') {
            setLivePartial('');
            setSttResult(data);
            setSttBusy(false);
          } else if (data.type === 'error') {
            setSttError(data.error || 'Realtime STT error');
            setSttBusy(false);
          }
        };
        ws.onerror = () => {
          setSttError('Realtime STT websocket failed');
          setRecording(false);
          setSttBusy(false);
        };
        ws.onclose = () => {
          setRecording(false);
          setSttBusy(false);
        };

        processor.onaudioprocess = event => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const channel = event.inputBuffer.getChannelData(0);
          ws.send(downsampleToPcm16(channel, audioContext.sampleRate));
        };

        sttWsRef.current = ws;
        audioContextRef.current = audioContext;
        processorRef.current = processor;
        sourceRef.current = source;
        liveStreamRef.current = stream;
        setSttBusy(true);
      } catch (e) {
        setSttError(e instanceof Error ? e.message : 'Could not access microphone');
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        setRecUrl(URL.createObjectURL(blob));
        setSttBusy(true);
        try {
          const fd = new FormData();
          fd.append('audio', blob, 'recording.webm');
          fd.append('provider', provider);
          const r = await fetch(`${LAB_BASE}/lab/stt`, { method: 'POST', body: fd });
          if (!r.ok) throw new Error(`STT failed (${r.status})`);
          setSttResult(await r.json());
        } catch (e) {
          setSttError(e instanceof Error ? e.message : 'STT error');
        } finally {
          setSttBusy(false);
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (e) {
      setSttError(e instanceof Error ? e.message : 'Could not access microphone');
    }
  }, [provider]);

  const stopRecording = useCallback(() => {
    if (provider === 'mistral-realtime') {
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      liveStreamRef.current?.getTracks().forEach(t => t.stop());
      void audioContextRef.current?.close();
      if (sttWsRef.current?.readyState === WebSocket.OPEN) {
        sttWsRef.current.send(JSON.stringify({ type: 'stop' }));
      }
      processorRef.current = null;
      sourceRef.current = null;
      liveStreamRef.current = null;
      audioContextRef.current = null;
      setRecording(false);
      return;
    }

    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, [provider]);

  return (
    <div className="mx-auto max-w-3xl p-6 text-gray-100">
      <h1 className="mb-1 text-2xl font-bold">Voice Lab</h1>
      <p className="mb-6 text-sm text-gray-400">
        Test speech-to-text and text-to-speech in isolation — quality and latency, no exam pipeline.
        Runtime: <code className="text-gray-300">{LAB_BASE}</code>
      </p>

      <div className="mb-6 flex gap-2">
        {(['tts', 'stt'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t === 'tts' ? 'Text → Speech' : 'Speech → Text'}
          </button>
        ))}
      </div>

      {tab === 'tts' && (
        <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-5">
          <textarea
            value={ttsText}
            onChange={e => setTtsText(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-700 bg-gray-950 p-3 text-sm"
            placeholder="Paste any text to synthesize…"
          />
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm">
              Voice{' '}
              <select
                value={voice}
                onChange={e => setVoice(e.target.value)}
                className="ml-1 rounded-md border border-gray-700 bg-gray-950 p-2 text-sm"
              >
                {voices.map(v => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Speed {speed.toFixed(2)}×{' '}
              <input
                type="range"
                min={0.5}
                max={1.5}
                step={0.05}
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="ml-1 align-middle"
              />
            </label>
            <button
              onClick={speak}
              disabled={ttsBusy || !ttsText.trim()}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {ttsBusy ? 'Synthesizing…' : 'Speak'}
            </button>
          </div>
          {ttsError && <p className="text-sm text-red-400">{ttsError}</p>}
          {ttsResult && (
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Metric label="Synth time" value={`${ttsResult.synthSeconds ?? '?'}s`} />
              <Metric label="Audio length" value={`${ttsResult.audioSeconds ?? '?'}s`} />
              <Metric label="RTF" value={ttsResult.rtf ?? '?'} hint="<1 = faster than realtime" />
              <Metric label="Round-trip" value={`${ttsResult.roundTripSeconds}s`} />
            </div>
          )}
        </div>
      )}

      {tab === 'stt' && (
        <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-5">
          <label className="text-sm">
            Provider{' '}
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              className="ml-1 rounded-md border border-gray-700 bg-gray-950 p-2 text-sm"
            >
              <option value="voxtral-batch">Voxtral (batch)</option>
              <option value="mistral-realtime">Voxtral Realtime (streamed)</option>
            </select>
          </label>
          <div className="flex items-center gap-3">
            {!recording ? (
              <button
                onClick={startRecording}
                disabled={sttBusy}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {sttBusy ? 'Transcribing…' : '● Record'}
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                ■ Stop
              </button>
            )}
            {recording && <span className="text-sm text-red-400">recording…</span>}
          </div>
          {recUrl && <audio src={recUrl} controls className="w-full" />}
          {sttError && <p className="text-sm text-red-400">{sttError}</p>}
          {(sttResult || livePartial) && (
            <div className="space-y-2">
              <div className="rounded-md border border-gray-700 bg-gray-950 p-3 text-sm">
                {livePartial || sttResult?.text || <span className="text-gray-500">(empty)</span>}
              </div>
              {sttResult && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Metric label="Provider" value={sttResult.provider} />
                  <Metric label="Latency" value={`${sttResult.latencySeconds}s`} />
                  {sttResult.firstTokenLatencySeconds != null && (
                    <Metric label="First token" value={`${sttResult.firstTokenLatencySeconds}s`} />
                  )}
                  {sttResult.model && <Metric label="Model" value={sttResult.model} />}
                </div>
              )}
              {recording && provider === 'mistral-realtime' && (
                <div className="text-xs text-emerald-400">
                  Live websocket streaming to Mistral realtime
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500">
            Voxtral Realtime streams mic PCM over WebSocket and renders partial text while
            recording. Voxtral batch transcribes only after stop.
          </p>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-gray-700 bg-gray-950 p-2">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-mono text-base">{value}</div>
      {hint && <div className="text-[10px] text-gray-500">{hint}</div>}
    </div>
  );
}
