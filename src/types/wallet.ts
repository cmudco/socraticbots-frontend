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
  lastRefillAt: string | null;
}

export interface WalletStatusExternal {
  kind: 'EXTERNAL';
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
}

export interface WalletsResponse {
  activeWallet: { type: ActiveWalletType; refId: string | null };
  byoEnabled: boolean;
  wallets: WalletEntry[];
}

export interface TransactionRow {
  id: number;
  amount: string;
  type: 'Debit' | 'Credit' | string;
  source: string;
  message: string;
  llmName: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  billingMode: string;
  platform: string;
  createdAt: string;
  botId?: number | null;
  fallbackReason?: string | null;
}

export interface TransactionsResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: TransactionRow[];
  summary: { all: number; wallet: number; ownApi: number };
}

export interface EffectivePolicy {
  amount: string;
  periodDays: number;
  amountSource: 'USER' | 'GROUP' | 'SYSTEM';
  periodSource: 'USER' | 'GROUP' | 'SYSTEM';
}
