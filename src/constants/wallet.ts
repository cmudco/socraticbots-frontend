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

/** Who pays for a model saved on a bot (bot-scoped picker entries). */
export const BotModelPaidBy = {
  CHATTER: 'CHATTER',
  OWNER: 'OWNER',
} as const;

export type BotModelPaidBy = (typeof BotModelPaidBy)[keyof typeof BotModelPaidBy];

/** Where a LiteLLM key came from, as DARE reports it. */
export const LiteLLMKeySource = {
  USER: 'USER',
  ADMIN_USER: 'ADMIN_USER',
  ADMIN_GROUP: 'ADMIN_GROUP',
} as const;

const LITELLM_MODEL_PREFIX = 'litellm:';

/** Picker ids are `"<pk>"` for DARE models or `litellm:<key>:<model>` for gateway models. */
export const isLiteLLMModelId = (modelId: string | null | undefined): modelId is string =>
  !!modelId && modelId.startsWith(LITELLM_MODEL_PREFIX);

/** The model name inside a LiteLLM picker id. */
export const liteLLMModelName = (modelId: string): string => modelId.split(':').slice(2).join(':');
