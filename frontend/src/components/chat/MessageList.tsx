// src/components/chat/MessageList.tsx
import React from 'react';
import { ChatMessage } from '../../services/chat.service';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  greeting?: string;
  pendingUserMessage?: ChatMessage | null;
  isStreaming?: boolean;
  pendingAssistantMessage?: ChatMessage | null;  // Add this prop
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  greeting, 
  pendingUserMessage,
  isStreaming,
  pendingAssistantMessage
}) => {
  // Create a copy of messages to avoid mutating props
  const allMessages = [...messages];
  
  // If there are no messages but there is a greeting, create a greeting message
  if (messages.length === 0 && greeting) {
    const greetingMessage: ChatMessage = {
      id: 'greeting',
      role: 'assistant',
      content: greeting,
      created_at: new Date().toISOString(),
    };
    allMessages.unshift(greetingMessage);
  }
  
  // Add pending user message if it exists and isn't already in the message list
  if (pendingUserMessage && !allMessages.some(msg => msg.content === pendingUserMessage.content)) {
    allMessages.push(pendingUserMessage);
  }

  // Add pending assistant message if streaming
  if (pendingAssistantMessage) {
    allMessages.push(pendingAssistantMessage);
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
          isPending={message.id.startsWith('pending-')}
          isStreaming={isStreaming && message.id.startsWith('streaming-')}  // Add this prop
        />
      ))}
      
      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-center text-gray-500 ml-2 mt-2">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="ml-2 text-sm">Assistant is responding...</span>
        </div>
      )}
    </div>
  );
};

export default MessageList;
