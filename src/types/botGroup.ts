// Import Bot lazily in consumers to avoid circular deps; here we type as any to keep flexibility
import type { Bot } from './bot';

export interface User {
  id: number;
  email: string;
  name?: string;
  isProfessor: boolean;
}

export interface BotGroup {
  id: number;
  title: string;
  description: string;
  botsCount: number;
  collaborators: string[]; // List of collaborator names/emails
  ownerId: number;
  redeemed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BotGroupDetail extends BotGroup {
  bots: Bot[]; // API returns full Bot-like objects
}
