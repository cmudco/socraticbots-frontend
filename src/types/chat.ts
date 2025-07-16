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
  created_at: string;
  sender?: ChatSender;
  timestamp?: string;
}

export interface ChapterDetails {
  id: string;
  title: string;
  subject: string;
  topic: string;
  created_at: string;
  greeting?: string;
}

export interface Conversation {
  id: string;
  user: string;
  chapter: string;
  chapter_details?: ChapterDetails;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
  latest_progress?: string | null;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
}
