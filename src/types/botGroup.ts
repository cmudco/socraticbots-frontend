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

// Forward declaration - Bot will be imported where needed
export interface BotGroupDetail extends BotGroup {
  bots: unknown[]; // Will be properly typed as Bot[] in components that import both types
}