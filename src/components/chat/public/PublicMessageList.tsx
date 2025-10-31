import React, { useEffect, useRef } from 'react';

import { Bot as BotIcon, Loader2 } from 'lucide-react';

import {
  usePublicBotStore,
  usePublicIsTyping,
  usePublicMessages,
} from '@/stores/core/publicBotStore';

import { scrollManager } from '@/utils/scrollManager';

import PublicMessageBubble from './PublicMessageBubble';

interface PublicMessageListProps {
  className?: string;
}

const PublicMessageList: React.FC<PublicMessageListProps> = ({ className = '' }) => {
  const messages = usePublicMessages();
  const isStreaming = usePublicIsTyping();
  const { isLoadingBot, botInfo } = usePublicBotStore();
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
      }, 300);

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

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className={`flex h-full items-center justify-center ${className}`}>
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <div className="from-primary/20 to-primary/10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br">
            <BotIcon className="text-primary h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground text-xl font-semibold">
              {botInfo?.title || 'Chat Bot'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {botInfo?.prompts?.greeting || 'Start a conversation by sending a message below.'}
            </p>
          </div>
          {botInfo?.subject && botInfo?.topic && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1">
                {botInfo.subject}
              </span>
              <span className="bg-secondary/10 text-secondary-foreground rounded-full px-3 py-1">
                {botInfo.topic}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`from-muted/30 via-background to-primary/5 max-h-full overflow-y-auto bg-gradient-to-br ${className}`}
    >
      <div className="mx-auto max-w-4xl px-4 py-6">
        {messages.map(message => {
          return (
            <PublicMessageBubble
              key={message.id}
              message={message}
              isStreaming={message.streaming}
            />
          );
        })}

        {isStreaming && messages[messages.length - 1]?.senderType !== 'ASSISTANT' && (
          <div className="mb-6 flex justify-start">
            <div className="border-border bg-background text-foreground mr-4 rounded-2xl border px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="from-secondary to-secondary/80 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br">
                  <span className="text-secondary-foreground text-xs font-semibold">AI</span>
                </div>
                <div className="flex gap-1">
                  <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                  <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                  <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default PublicMessageList;
