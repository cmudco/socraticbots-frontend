// src/types/chat.ts
export interface Message {
    id: string;
    content: string;
    type: 'system' | 'user' | 'ai';
    timestamp: Date;
}
