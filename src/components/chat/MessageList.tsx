// src/components/chat/MessageList.tsx
import React from 'react';
import type { ChatMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';
import { ChatRole, ChatSender } from '@/types/chat';

interface MessageListProps {
  messages: ChatMessage[];
  greeting?: string;
}

function normalizeMessage(msg: ChatMessage): ChatMessage {
  if (msg.sender) return msg;
  let sender: ChatSender | undefined;
  if (msg.role === ChatRole.ASSISTANT) sender = ChatSender.ASSISTANT;
  else if (msg.role === ChatRole.USER) sender = ChatSender.USER;
  else if (msg.role === ChatRole.SYSTEM) sender = ChatSender.SYSTEM;
  return { ...msg, sender };
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  greeting
}) => {
  // Create a copy of messages to avoid mutating props
  const allMessages = [...messages];

  // If there are no messages but there is a greeting, create a greeting message
  if (messages.length === 0 && greeting) {
    const now = new Date().toISOString();
    const greetingMessage: ChatMessage = {
      id: 'greeting',
      role: ChatRole.ASSISTANT,
      content: greeting,
      created_at: now,
      sender: ChatSender.ASSISTANT,
      timestamp: now,
    };
    allMessages.unshift(greetingMessage);
  }

  // Normalize all messages to ensure sender is set
  const normalizedMessages = allMessages.map(normalizeMessage);

  if (normalizedMessages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <p>Start a new conversation</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {normalizedMessages.map((message) => (
        <div key={message.id} className={message.id.startsWith('pending-') ? 'opacity-70' : ''}>
          <MessageBubble
            message={message}
            isGreeting={message.id === 'greeting'}
          />
        </div>
      ))}
    </div>
  );
};

export default MessageList;
