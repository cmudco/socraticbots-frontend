/**
 * Common formatting utilities.
 */

/**
 * Format a date string for display.
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a short date (without time).
 */
export const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format duration in seconds to human-readable format.
 */
export const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

/**
 * Format time in call (mm:ss format).
 */
export const formatTimeInCall = (seconds?: number): string => {
  if (seconds === undefined) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format a USD amount for the wallet UI.
 *
 * Behavior:
 * - Strings or numbers accepted (DARE returns Decimal-as-string).
 * - Tiny non-zero amounts (< $0.01) keep up to 6 decimals so per-call costs
 *   like $0.000123 stay visible instead of rounding to $0.00.
 * - Everything else uses 2 decimals (`$X.XX`).
 */
export const formatCurrency = (
  value: number | string | null | undefined,
  options?: { decimals?: number }
): string => {
  if (value === null || value === undefined || value === '') return '$0.00';
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return '$0.00';

  const explicitDecimals = options?.decimals;
  if (typeof explicitDecimals === 'number') {
    return `$${num.toFixed(explicitDecimals)}`;
  }
  if (num !== 0 && Math.abs(num) < 0.01) {
    return `$${num.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')}`;
  }
  return `$${num.toFixed(2)}`;
};
