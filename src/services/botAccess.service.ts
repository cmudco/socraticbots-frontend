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
  isCreator: boolean;
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

export interface UserConversation {
  conversationId: string;
  title: string | null;
  createdAt: string;
  messageCount: number;
  botId: number;
}

export interface UserConversationsResponse {
  userId: number;
  userEmail: string;
  userName: string;
  botId: number;
  botTitle: string;
  conversations: UserConversation[];
  totalCount: number;
}

export interface ConversationMessage {
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ConversationMessagesResponse {
  conversationId: string;
  title: string | null;
  messages: ConversationMessage[];
  totalCount: number;
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

  async getUserConversations(
    botGroupId: number,
    botId: number,
    userId: number
  ): Promise<UserConversationsResponse> {
    return baseRequest<UserConversationsResponse>({
      url: `conversations/bot-groups/${botGroupId}/bots/${botId}/users/${userId}/conversations/`,
      method: METHOD.GET,
    });
  }

  async getConversationMessages(
    botGroupId: number,
    botId: number,
    conversationId: string
  ): Promise<ConversationMessagesResponse> {
    return baseRequest<ConversationMessagesResponse>({
      url: `conversations/bot-groups/${botGroupId}/bots/${botId}/conversations/${conversationId}/messages/`,
      method: METHOD.GET,
    });
  }
}

export const botAccessService = new BotAccessService();
