import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

export interface BotAccessUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  accessType:
    | 'direct_bot'
    | 'bot_group'
    | 'bot_group_owner'
    | 'bot_group_collaborator'
    | 'bot_creator';
  accessCode: string;
  accessGrantedAt: string;
  isProfessor: boolean;
}

export interface BotAccessUsersResponse {
  botId: number;
  botTitle: string;
  botGroupId: number;
  botGroupTitle: string;
  accessUsers: BotAccessUser[];
  totalCount: number;
}

export interface RemoveUserAccessResponse {
  message: string;
  deletedAcceptances: number;
}

class BotAccessService {
  async getBotAccessUsers(botGroupId: number, botId: number): Promise<BotAccessUsersResponse> {
    return baseRequest<BotAccessUsersResponse>({
      url: `access-codes/bot-groups/${botGroupId}/bots/${botId}/users/`,
      method: METHOD.GET,
    });
  }

  async removeUserBotAccess(
    botGroupId: number,
    botId: number,
    userId: number
  ): Promise<RemoveUserAccessResponse> {
    return baseRequest<RemoveUserAccessResponse>({
      url: `access-codes/bot-groups/${botGroupId}/bots/${botId}/users/${userId}/remove/`,
      method: METHOD.DELETE,
    });
  }
}

export const botAccessService = new BotAccessService();
