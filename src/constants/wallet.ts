export const WalletScopedType = {
  DARE: 'DARE',
  BYO: 'BYO',
  LITELLM: 'LITELLM',
} as const;

export type WalletScopedType = (typeof WalletScopedType)[keyof typeof WalletScopedType];

export const WalletEmptyReason = {
  NO_KEYS: 'NO_KEYS',
  PROBE_FAILED: 'PROBE_FAILED',
  TARGET_KEY_DELETED: 'TARGET_KEY_DELETED',
} as const;

export type WalletEmptyReason = (typeof WalletEmptyReason)[keyof typeof WalletEmptyReason];
