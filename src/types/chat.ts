export enum ChatRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum ChatSender {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface ChatMessage {
  id: string;
  conversation?: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  sender?: ChatSender;
  timestamp?: string;
}

// Old chapter-based interfaces removed - we use bot-based architecture now
// All conversation handling is done via DARE backend and conversationService
