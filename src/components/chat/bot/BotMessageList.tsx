import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useMessages, useIsTyping, useConversationStore } from '@/stores/core/conversationStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmptyState from './EmptyState';

interface BotMessageListProps {
  className?: string;
}


const BotMessageList: React.FC<BotMessageListProps> = ({ 
  className = ''
}) => {
  const messages = useMessages();
  const isStreaming = useIsTyping();
  const { isLoadingMessages } = useConversationStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isStreaming]);

  if (isLoadingMessages) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-slate-600">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/30 via-white to-blue-50/20 ${className}`}
    >
      <div className="mx-auto max-w-4xl px-4 py-6">
        {messages.map((message,) => {
          return (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isStreaming={message.streaming}
            />
          );
        })}
        
        {isStreaming && messages[messages.length - 1]?.senderType !== 'ASSISTANT' && (
          <TypingIndicator />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default BotMessageList;