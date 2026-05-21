import { useEffect, useRef, useState } from 'react';

interface RawUtterance {
  name: string;
  url: string;
}

interface DiagnosticPlaybackProps {
  /** Already-captured WebRTC playback (Blob URL). */
  recordedAudio: { url: string; mime: string } | null;
  /** Function that hits the runtime and returns raw Mistral WAV Blob URLs. */
  fetchRawUtterances: () => Promise<RawUtterance[]>;
  /** Called when the user dismisses the panel — proceeds to results UI. */
  onContinue?: () => void;
}

/**
 * Side-by-side audio comparison panel rendered after the exam ends.
 *
 * - "Path A" plays the raw Mistral PCM the runtime received (control).
 * - "Path B" plays what the browser decoded off the WebRTC stream
 *   (suspect — went through Pipecat transport + Opus encode/decode).
 *
 * Both play in this same browser through the same speakers, so any
 * audible delta between the two is introduced *between* Mistral and the
 * browser, not by the playback hardware or speakers.
 */
export const DiagnosticPlayback = ({
  recordedAudio,
  fetchRawUtterances,
  onContinue,
}: DiagnosticPlaybackProps) => {
  const [rawUtterances, setRawUtterances] = useState<RawUtterance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const blobUrlsToCleanupRef = useRef<string[]>([]);

  const handleLoad = async () => {
    setIsLoading(true);
    const list = await fetchRawUtterances();
    blobUrlsToCleanupRef.current.push(...list.map(u => u.url));
    setRawUtterances(list);
    setHasLoaded(true);
    setIsLoading(false);
  };

  useEffect(() => {
    // Revoke all Blob URLs when this panel unmounts.
    return () => {
      blobUrlsToCleanupRef.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlsToCleanupRef.current = [];
    };
  }, []);

  return (
    <div className="mt-6 rounded-lg border border-yellow-500/40 bg-yellow-500/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-yellow-300">
          🔬 Diagnostic playback (debug only)
        </h4>
        {!hasLoaded && (
          <button
            type="button"
            onClick={() => void handleLoad()}
            disabled={isLoading}
            className="rounded border border-yellow-500/40 px-3 py-1 text-xs font-medium text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-50"
          >
            {isLoading ? 'Loading…' : 'Load raw Mistral audio'}
          </button>
        )}
      </div>

      {/* Path B: browser-decoded WebRTC audio */}
      <div className="mb-4">
        <div className="mb-1 text-xs font-medium text-yellow-200/90">
          Path B — Browser-decoded WebRTC (suspect)
        </div>
        <div className="text-foreground/60 mb-2 text-[11px]">
          Mistral → Pipecat → Opus encode → WebRTC → Opus decode → speakers
        </div>
        {recordedAudio ? (
          <audio
            controls
            src={recordedAudio.url}
            className="w-full"
            style={{ filter: 'invert(0.9)' }}
          />
        ) : (
          <div className="text-foreground/60 text-xs italic">No recording captured.</div>
        )}
      </div>

      {/* Path A: raw Mistral PCM, fetched as WAV */}
      <div>
        <div className="mb-1 text-xs font-medium text-yellow-200/90">
          Path A — Raw Mistral PCM (control, per utterance)
        </div>
        <div className="text-foreground/60 mb-2 text-[11px]">
          Mistral → runtime → WAV → HTTP → &lt;audio&gt; → speakers (no Opus, no WebRTC)
        </div>
        {!hasLoaded && (
          <div className="text-foreground/60 text-xs italic">
            Click "Load raw Mistral audio" above to fetch per-utterance WAVs.
          </div>
        )}
        {hasLoaded && rawUtterances.length === 0 && (
          <div className="text-foreground/60 text-xs italic">
            No raw utterances on the runtime for this session.
          </div>
        )}
        {rawUtterances.map(utt => (
          <div key={utt.name} className="mb-2">
            <div className="text-foreground/70 mb-1 font-mono text-[11px]">{utt.name}</div>
            <audio controls src={utt.url} className="w-full" style={{ filter: 'invert(0.9)' }} />
          </div>
        ))}
      </div>

      {onContinue && (
        <div className="mt-4 flex justify-end border-t border-yellow-500/20 pt-3">
          <button
            type="button"
            onClick={onContinue}
            className="rounded border border-yellow-500/40 px-4 py-1.5 text-xs font-medium text-yellow-300 hover:bg-yellow-500/10"
          >
            Continue to results →
          </button>
        </div>
      )}
    </div>
  );
};
