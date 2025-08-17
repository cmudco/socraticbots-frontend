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
  createdAt: string;
  updatedAt: string;
}

// Import Bot lazily in consumers to avoid circular deps; here we type as any to keep flexibility
export interface BotGroupDetail extends BotGroup {
  bots: any[]; // API returns full Bot-like objects
}