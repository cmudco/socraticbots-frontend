/**
 * Wallet types — mirror the camelCase shapes returned by the SB
 * `/api/wallet/*` endpoints, which are pure pass-throughs to DARE's
 * `/api/billing/*`. Keep these aligned with the DARE serializer output;
 * never re-shape on the SB side.
 */

export type ActiveWalletType = 'DARE' | 'BYO' | 'LITELLM';

export interface WalletStatusBalance {
  kind: 'BALANCE';
  balance: string;
  /** Balance scheduled refills top the wallet up to. */
  ceiling?: string;
  lastRefillAt: string | null;
}

/** A member's allowance on their group's LiteLLM key. */
export interface SpendLimit {
  limit: string;
  used: string;
  isReached: boolean;
}

export interface WalletStatusExternal {
  kind: 'EXTERNAL';
  /** LiteLLM keys: reference cost of this user's calls through the key. */
  spend?: string | null;
  spendLimit?: SpendLimit | null;
}

export type WalletStatus = WalletStatusBalance | WalletStatusExternal;

export interface WalletEntry {
  type: ActiveWalletType;
  refId: string | null;
  label: string;
  isDefault: boolean;
  isActive: boolean;
  status: WalletStatus;
  // BYO / LiteLLM-only optional fields:
  provider?: string;
  source?: string;
  groupName?: string | null;
  expiresAt?: string | null;
  baseUrl?: string;
  backgroundModel?: string;
}

export interface WalletsResponse {
  activeWallet: { type: ActiveWalletType; refId: string | null };
  byoEnabled: boolean;
  litellmEnabled: boolean;
  wallets: WalletEntry[];
}

export interface LiteLLMTestResponse {
  ok: boolean;
  models: string[];
  recommendedModels: string[];
  error: string | null;
}

export interface NewLiteLLMKey {
  label: string;
  baseUrl: string;
  apiKey: string;
  backgroundModel: string;
}

/** A bot whose chat model routes through a LiteLLM key. */
export interface LiteLLMKeyDependentBot {
  botId: number;
  botTitle: string;
  botGroupTitle: string;
}

export interface LiteLLMKeyDependents {
  botCount: number;
  bots: LiteLLMKeyDependentBot[];
}

export type ProviderKeyProvider = 'openai' | 'claude' | 'gemini';

export interface ProviderKeyStatus {
  hasKey: boolean;
  maskedKey: string | null;
  providerDisplay: string;
}

export interface ProviderKeyStatusMap {
  openai: ProviderKeyStatus;
  claude: ProviderKeyStatus;
  gemini: ProviderKeyStatus;
}

/** DARE's per-bot usage: chatters' DARE wallet spend and the owner's sponsored spend. */
export interface BotUsageTotals {
  totalCost: string;
  sponsoredCost: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  messageCount: number;
}

export interface BotUsageUserRow {
  userId: number | null;
  userEmail: string;
  totalCost: string;
  sponsoredCost: string;
  messageCount: number;
}

export interface BotUsageResponse {
  botId: number;
  period: string;
  groupBy: 'user' | 'date';
  totals: BotUsageTotals;
  userBreakdown: BotUsageUserRow[] | null;
}
