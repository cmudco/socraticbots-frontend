import React, { useEffect, useRef } from 'react';

import { Loader2 } from 'lucide-react';

import {
  useConversationStore,
  useIsLoadingBot,
  useIsTyping,
  useMessages,
} from '@/stores/core/conversationStore';

import { scrollManager } from '@/utils/scrollManager';

import EmptyState from './EmptyState';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface BotMessageListProps {
  className?: string;
}

const BotMessageList: React.FC<BotMessageListProps> = ({ className = '' }) => {
  const messages = useMessages();
  const isStreaming = useIsTyping();
  const isLoadingBot = useIsLoadingBot();
  const { isLoadingMessages } = useConversationStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        });
      }
    };

    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        });
      }
    };

    const unsubscribe = scrollManager.subscribe(scrollToBottom);
    return unsubscribe;
  }, []);

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessageContent = lastMessage?.message || '';

  useEffect(() => {
    if (isStreaming && lastMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  }, [lastMessageContent, isStreaming, lastMessage]);

  useEffect(() => {
    if (isStreaming && messages.length > 0) {
      const interval = setInterval(() => {
        if (messagesEndRef.current) {
          const container = containerRef.current;
          if (container) {
            const isNearBottom =
              container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            if (isNearBottom) {
              messagesEndRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
              });
            }
          }
        }
      }, 300); // More frequent updates during streaming

      return () => clearInterval(interval);
    }
  }, [isStreaming, messages.length]);

  if (isLoadingBot) {
    return (
      <div className={`flex h-full items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="text-muted-foreground">Connecting to bot...</span>
        </div>
      </div>
    );
  }

  if (isLoadingMessages) {
    return (
      <div className={`flex h-full items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="text-muted-foreground">Loading conversation...</span>
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
      className={`from-muted/30 via-background to-primary/5 min-h-0 flex-1 overflow-y-auto bg-gradient-to-br ${className}`}
    >
      <div className="mx-auto max-w-4xl px-4 py-6">
        {messages.map(message => {
          return (
            <MessageBubble key={message.id} message={message} isStreaming={message.streaming} />
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
