export const LevelMeter = ({
  label,
  value,
  detail,
  gate,
}: {
  label: string;
  value: number;
  detail: string;
  gate?: number;
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-baseline justify-between">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-muted-foreground font-mono text-xs">{detail}</span>
    </div>
    <div className="bg-muted relative h-3 overflow-hidden rounded-full">
      <div
        className={`h-full rounded-full transition-[width] duration-100 ${
          gate !== undefined && value < gate ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
        style={{ width: `${Math.min(100, Math.round(value * 100))}%` }}
      />
      {gate !== undefined && (
        <div
          className="absolute top-0 h-full w-0.5 bg-red-500/80"
          style={{ left: `${Math.round(gate * 100)}%` }}
          title={`VAD gate (min_volume=${gate}) — speech below this line is ignored`}
        />
      )}
    </div>
  </div>
);
