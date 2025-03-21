// src/components/chat/MessageList.tsx
import React from 'react';
import { ChatMessage } from '../../services/chat.service';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  greeting?: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, greeting }) => {
  // If there are no messages but there is a greeting, create a fake message
  const allMessages = [...messages];
  
  if (messages.length === 0 && greeting) {
    const greetingMessage: ChatMessage = {
      id: 'greeting',
      role: 'assistant',
      content: greeting,
      created_at: new Date().toISOString(),
    };
    allMessages.unshift(greetingMessage);
  }
  
  if (allMessages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <p>Start a new conversation</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 py-4">
      {allMessages.map((message, index) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isGreeting={message.id === 'greeting'}
        />
      ))}
    </div>
  );
};

export default MessageList;
