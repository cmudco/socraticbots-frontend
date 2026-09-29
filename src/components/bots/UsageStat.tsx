interface UsageStatProps {
  label: string;
  value: string;
}

/** One figure in a bot's usage summary. */
export const UsageStat = ({ label, value }: UsageStatProps) => (
  <div className="border-border rounded-md border p-3">
    <div className="text-muted-foreground text-xs">{label}</div>
    <div className="text-lg font-semibold tabular-nums">{value}</div>
  </div>
);
