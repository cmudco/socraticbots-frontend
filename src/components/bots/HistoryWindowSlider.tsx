import React from 'react';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

/** 0 is the whole conversation, so it sits at the far right of the track. */
export const WHOLE_CONVERSATION = 0;
const STOPS = [10, 20, 30, 50, 75, 100, 150, 200, WHOLE_CONVERSATION];

const stopIndex = (value: number) => {
  const index = STOPS.indexOf(value);
  if (index !== -1) return index;
  // A value saved outside the stops snaps to the nearest one below it.
  const below = STOPS.filter(stop => stop !== WHOLE_CONVERSATION && stop <= value);
  return below.length ? STOPS.indexOf(below[below.length - 1]) : 0;
};

const describe = (value: number) =>
  value === WHOLE_CONVERSATION ? 'Whole conversation' : `Last ${value} messages`;

interface HistoryWindowSliderProps {
  id: string;
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const HistoryWindowSlider: React.FC<HistoryWindowSliderProps> = ({
  id,
  label,
  description,
  value,
  onChange,
  disabled = false,
}) => (
  <div className="space-y-3">
    <div className="flex items-baseline justify-between gap-3">
      <Label htmlFor={id}>{label}</Label>
      <span className="text-foreground text-sm font-medium tabular-nums">{describe(value)}</span>
    </div>
    <Slider
      id={id}
      aria-label={label}
      aria-valuetext={describe(value)}
      value={[stopIndex(value)]}
      onValueChange={([index]) => onChange(STOPS[index])}
      min={0}
      max={STOPS.length - 1}
      step={1}
      disabled={disabled}
    />
    <div className="text-muted-foreground flex justify-between text-xs">
      <span>{STOPS[0]} messages</span>
      <span>Whole conversation</span>
    </div>
    <p className="text-muted-foreground text-xs">{description}</p>
  </div>
);

export default HistoryWindowSlider;
