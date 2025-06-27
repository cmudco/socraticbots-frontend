// Chat types and enums for the chat module

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
  conversation?: string; // UUID, optional for now
  role: ChatRole;
  content: string;
  created_at: string;
  // UI compatibility fields
  sender?: ChatSender; // maps to role
  timestamp?: string; // maps to created_at
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

// Add enums for status, sender, etc. as needed