// Import Bot lazily in consumers to avoid circular deps; here we type as any to keep flexibility
import type { Bot } from './bot';

export interface User {
  id: number;
  email: string;
  name?: string;
  isCreator: boolean;
}

export interface BotGroupAccessCode {
  code: string;
  limit?: number;
  used?: number;
  createdAt: string;
  createdBy: string;
}

export interface BotGroup {
  id: number;
  title: string;
  description: string;
  botsCount: number;
  collaborators: string[]; // List of collaborator names/emails
  ownerId: number;
  redeemed?: boolean;
  accessCode?: BotGroupAccessCode;
  createdAt: string;
  updatedAt: string;
}

export interface BotGroupDetail extends BotGroup {
  bots: Bot[]; // API returns full Bot-like objects
}

export interface CreateBotGroupRequest {
  title: string;
  description: string;
  accessCode?: string;
  accessCodeLimit?: number;
}

export interface UpdateBotGroupRequest {
  title?: string;
  description?: string;
  accessCode?: string;
  accessCodeLimit?: number;
}
