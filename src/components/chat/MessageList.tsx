// src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';

import type { ChatMessage } from '@/types/chat';
import { ChatRole, ChatSender } from '@/types/chat';

import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  greeting?: string;
  isStreaming?: boolean;
}

function normalizeMessage(msg: ChatMessage): ChatMessage {
  if (msg.sender) return msg;
  let sender: ChatSender | undefined;
  if (msg.role === ChatRole.ASSISTANT) sender = ChatSender.ASSISTANT;
  else if (msg.role === ChatRole.USER) sender = ChatSender.USER;
  else if (msg.role === ChatRole.SYSTEM) sender = ChatSender.SYSTEM;
  return { ...msg, sender };
}

const MessageList: React.FC<MessageListProps> = ({ messages, greeting, isStreaming = false }) => {
  const allMessages = [...messages];
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
  const normalizedMessages = allMessages.map(normalizeMessage);

  // Auto-scroll to bottom
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [normalizedMessages.length, isStreaming]);

  if (normalizedMessages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <p>Start a new conversation</p>
      </div>
    );
  }

  // Find the last AI message index
  const lastAssistantIdx = [...normalizedMessages]
    .reverse()
    .findIndex(m => m.sender === ChatSender.ASSISTANT);
  const lastAssistantAbsIdx =
    lastAssistantIdx === -1 ? -1 : normalizedMessages.length - 1 - lastAssistantIdx;

  return (
    <div ref={listRef} className="mx-auto h-full max-w-5xl space-y-0 overflow-y-auto px-4 py-4">
      {normalizedMessages.map((message, idx) => (
        <div key={message.id} className={message.id.startsWith('pending-') ? 'opacity-70' : ''}>
          <MessageBubble
            message={message}
            isGreeting={message.id === 'greeting'}
            isStreaming={isStreaming && idx === lastAssistantAbsIdx}
          />
        </div>
      ))}
    </div>
  );
};

export default MessageList;
