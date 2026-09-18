import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import { SttProvider } from '@/types/pipecat';

interface BackupSpeechControlProps {
  available: boolean;
  provider: SttProvider;
  onSwitch: () => Promise<boolean>;
}

export default function BackupSpeechControl({
  available,
  provider,
  onSwitch,
}: BackupSpeechControlProps) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const promptId = useId();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  if (!available) return null;
  const switchProvider = async () => {
    setPending(true);
    setFailed(false);
    try {
      const accepted = await onSwitch();
      if (mounted.current) setFailed(!accepted);
    } catch {
      if (mounted.current) setFailed(true);
    } finally {
      if (mounted.current) setPending(false);
    }
  };
  return (
    <div className="space-y-1 text-sm">
      {provider === 'whisper' ? (
        <p role="status">
          Backup recognition is selected. Pause after your answer so it can transcribe.
        </p>
      ) : (
        <>
          <p id={promptId}>Speaking, but your words aren’t appearing?</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            aria-busy={pending}
            aria-describedby={promptId}
            onClick={() => void switchProvider()}
          >
            {pending ? 'Switching recognition…' : 'Try backup speech recognition'}
          </Button>
          {failed ? (
            <p role="alert">The switch wasn’t confirmed. Check your connection and try again.</p>
          ) : null}
        </>
      )}
    </div>
  );
}
