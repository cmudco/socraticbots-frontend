import React, { useEffect, useState } from 'react';

import { Mic, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';

const NON_TOGGLE_TARGETS =
  'input, textarea, select, [contenteditable="true"], [role="combobox"], [role="listbox"], [role="option"], [role="menuitem"]';

interface PushToTalkControlProps {
  capturing: boolean;
  notice: string | null;
  onToggle: () => void;
}

export const PushToTalkControl: React.FC<PushToTalkControlProps> = ({
  capturing,
  notice,
  onToggle,
}) => {
  const [heldSeconds, setHeldSeconds] = useState(0);

  useEffect(() => {
    if (!capturing) return;
    setHeldSeconds(0);
    const interval = setInterval(() => setHeldSeconds(seconds => seconds + 1), 1000);
    return () => clearInterval(interval);
  }, [capturing]);

  useEffect(() => {
    const isSpaceForUs = (event: KeyboardEvent) =>
      event.code === 'Space' &&
      !(event.target instanceof Element && event.target.closest(NON_TOGGLE_TARGETS));

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSpaceForUs(event)) return;
      // Also stops a focused button from clicking itself and toggling twice.
      event.preventDefault();
      if (!event.repeat) onToggle();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (isSpaceForUs(event)) event.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onToggle]);

  return (
    <div className="space-y-2 border-b px-5 py-4">
      <Button size="lg" className="w-full" onClick={onToggle} aria-pressed={capturing}>
        {capturing ? <Send /> : <Mic />}
        {capturing ? 'Done — send my answer' : 'Talk'}
      </Button>
      <p className="text-muted-foreground text-center text-xs" aria-live="polite">
        {capturing
          ? `Listening… ${heldSeconds}s · press Space when you finish`
          : (notice ?? 'Press Space or the button to start your answer')}
      </p>
    </div>
  );
};

export default PushToTalkControl;
