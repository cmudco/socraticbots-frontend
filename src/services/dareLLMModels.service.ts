import { METHOD } from '@/constants/requests';
import { BotModelPaidBy, WalletEmptyReason, WalletScopedType } from '@/constants/wallet';

import { baseRequest } from '@/utils/baseRequest';

/**
 * Mirrors DARE's `LLMModel` vs `PickerModel` split (see DARE FE's
 * `redux/types/conversation.ts`):
 *
 * - `DareLLMModel` is the DB-backed row — `id` is the integer PK. Used by
 *   admin / detail lookups that key on the true PK.
 * - `PickerModel` is the chat-picker entry — `id` is opaque to the FE
 *   because LiteLLM-routed entries encode `(key_pk + model_name)` into a
 *   single dispatch reference. The BE emits either a stringified PK
 *   ("42") or `litellm:<key_pk>:<model_name>`; the FE renders & echoes
 *   it back; DARE inverts the encoding via `parse_model_id` on dispatch.
 *
 * SB stores the `PickerModel.id` verbatim in
 * `BotModelPreference.chat_model_dare_id` and forwards it on chat. It
 * never tries to interpret the id — that's DARE's job.
 */

interface CommonModelFields {
  name: string;
  identifier: string;
  provider: string;
  description?: string | null;
  isReasoning: boolean;
  isImageGenerator?: boolean;
  isAudioTranscriber?: boolean;
  inputTokenRatePerMillion: number | string | null;
  outputTokenRatePerMillion: number | string | null;
  tier: string | null;
  isSynthetic?: boolean;
}

/** DB-backed LLM row — `id` is the integer PK. */
export interface DareLLMModel extends CommonModelFields {
  id: number;
}

/** Picker / dispatch entry — `id` is the opaque DARE picker id. */
export interface PickerModel extends CommonModelFields {
  id: string;
  /** Bot scope: each chatter pays (DARE model) or the owner sponsors it (LiteLLM). */
  paidBy?: BotModelPaidBy;
  /** Bot scope, owner-paid: label of the owner's LiteLLM key. */
  sponsorKeyLabel?: string | null;
}

export interface WalletMeta {
  type: WalletScopedType;
  providers: string[];
  isEmpty: boolean;
  emptyReason: WalletEmptyReason | null;
  staleProbe: boolean;
}

export interface WalletScopedModelsResponse {
  models: PickerModel[];
  wallet: WalletMeta;
}

class DareLLMModelsService {
  /**
   * Unscoped list — returns picker entries (string ids). Use this when
   * you need to render a model dropdown but don't have a wallet context
   * (e.g. legacy admin views). For bot pickers, prefer the wallet-scoped
   * variant which also returns a wallet-empty signal.
   */
  async getDareLLMModels(): Promise<PickerModel[]> {
    return baseRequest<PickerModel[]>({
      url: 'bots/dare-llms/',
      method: METHOD.GET,
    });
  }

  async getWalletScopedDareLLMModels(walletScope: string): Promise<WalletScopedModelsResponse> {
    return baseRequest<WalletScopedModelsResponse>({
      url: 'bots/dare-llms/',
      method: METHOD.GET,
      params: { wallet_scope: walletScope },
    });
  }

  /** Single DB row by integer PK — only useful when you genuinely have a PK. */
  async getDareLLMModel(id: number): Promise<DareLLMModel> {
    return baseRequest<DareLLMModel>({
      url: `bots/dare-llms/${id}/`,
      method: METHOD.GET,
    });
  }

  async searchDareLLMModels(query: string): Promise<PickerModel[]> {
    return baseRequest<PickerModel[]>({
      url: 'bots/dare-llms/',
      method: METHOD.GET,
      params: { search: query },
    });
  }

  async getDareLLMModelsByProvider(provider: string): Promise<PickerModel[]> {
    return baseRequest<PickerModel[]>({
      url: 'bots/dare-llms/',
      method: METHOD.GET,
      params: { provider },
    });
  }
}

export const dareLLMModelsService = new DareLLMModelsService();
