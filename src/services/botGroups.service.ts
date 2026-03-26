import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import {
  BotGroup,
  BotGroupDetail,
  CreateBotGroupRequest,
  UpdateBotGroupRequest,
} from '@/types/botGroup';

export interface AddCollaboratorRequest {
  user_id: number;
}

class BotGroupService {
  async getBotGroups(options?: {
    ownedOnly?: boolean;
    search?: string;
  }): Promise<BotGroupDetail[]> {
    const params: Record<string, unknown> = {};
    if (options?.ownedOnly) params.owned_only = true;
    if (options?.search) params.search = options.search;
    return baseRequest<BotGroupDetail[]>({
      url: 'bot-groups/',
      method: METHOD.GET,
      params,
    });
  }

  async getBotGroup(id: number): Promise<BotGroupDetail> {
    return baseRequest<BotGroupDetail>({
      url: `bot-groups/${id}/`,
      method: METHOD.GET,
    });
  }

  async createBotGroup(botGroupData: CreateBotGroupRequest): Promise<BotGroup> {
    return baseRequest<BotGroup>({
      url: 'bot-groups/',
      method: METHOD.POST,
      data: botGroupData,
    });
  }

  async updateBotGroup(id: number, botGroupData: UpdateBotGroupRequest): Promise<BotGroup> {
    return baseRequest<BotGroup>({
      url: `bot-groups/${id}/`,
      method: METHOD.PATCH,
      data: botGroupData,
    });
  }

  async updateBotGroupAccessCode(
    id: number,
    accessCodeData: { accessCode?: string; accessCodeLimit?: number }
  ): Promise<BotGroup> {
    return baseRequest<BotGroup>({
      url: `bot-groups/${id}/`,
      method: METHOD.PATCH,
      data: {
        access_code: accessCodeData.accessCode,
        access_code_limit: accessCodeData.accessCodeLimit,
      },
    });
  }

  async deleteBotGroup(id: number): Promise<void> {
    return baseRequest<void>({
      url: `bot-groups/${id}/`,
      method: METHOD.DELETE,
    });
  }

  async addCollaborator(id: number, collaboratorData: AddCollaboratorRequest): Promise<void> {
    return baseRequest<void>({
      url: `bot-groups/${id}/add_collaborator/`,
      method: METHOD.POST,
      data: collaboratorData,
    });
  }

  async removeCollaborator(id: number, collaboratorData: AddCollaboratorRequest): Promise<void> {
    return baseRequest<void>({
      url: `bot-groups/${id}/remove_collaborator/`,
      method: METHOD.DELETE,
      data: collaboratorData,
    });
  }

  async searchBotGroups(query: string): Promise<BotGroup[]> {
    return baseRequest<BotGroup[]>({
      url: 'bot-groups/',
      method: METHOD.GET,
      params: { search: query },
    });
  }
}

export const botGroupService = new BotGroupService();
