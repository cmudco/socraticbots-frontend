import type { WalletEntry, WalletStatusBalance } from '@/types/wallet';

/** Two-decimal USD; usage below a cent reads "<$0.01" so it isn't mistaken for none. */
export const formatUsd = (amount: string): string => {
  const value = Number(amount);
  return value > 0 && value < 0.01 ? '<$0.01' : `$${value.toFixed(2)}`;
};

/** "$4.00 of $5.00" against the refill ceiling; a balance above it shows alone. */
export const formatBalanceOfCeiling = (status: WalletStatusBalance): string =>
  !status.ceiling || Number(status.balance) > Number(status.ceiling)
    ? formatUsd(status.balance)
    : `${formatUsd(status.balance)} of ${formatUsd(status.ceiling)}`;

const PROVIDER_NAMES = new Map([
  ['openai', 'OpenAI'],
  ['claude', 'Claude'],
  ['gemini', 'Gemini'],
  ['llama', 'LLaMA'],
]);

/** Providers a BYO wallet row covers, from DARE's comma-separated `provider`. */
export const byoProviders = (wallet: WalletEntry): string[] =>
  (wallet.provider ?? '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => PROVIDER_NAMES.get(p) ?? p);
