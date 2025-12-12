import React, { useCallback, useEffect, useRef, useState } from 'react';

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
  roundedClass?: string;
}

const PublicMessageList: React.FC<PublicMessageListProps> = ({
  className = '',
  roundedClass = 'rounded-2xl',
}) => {
  const messages = usePublicMessages();
  const isTyping = usePublicIsTyping();
  const { isLoadingBot, botInfo } = usePublicBotStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);
  const hasInitialScrolledRef = useRef<boolean>(false);
  const userScrolledUpRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number | null>(null);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  // Callback ref - will be called when the container element mounts
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node);
  }, []);

  // Force scroll to bottom
  const forceScrollToBottom = useCallback(() => {
    const anchor = messagesEndRef.current;
    if (!anchor) return;
    userScrolledUpRef.current = false;
    anchor.scrollIntoView({ behavior: 'auto' });
  }, []);

  // Smart scroll - respects user's scroll position
  const scrollToBottom = useCallback(() => {
    if (userScrolledUpRef.current) return;

    const anchor = messagesEndRef.current;
    if (!anchor) return;
    anchor.scrollIntoView({ behavior: 'auto' });
  }, []);

  // Attach wheel listeners when container element is available
  useEffect(() => {
    if (!containerEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        userScrolledUpRef.current = true;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const startY = touchStartYRef.current;
      if (startY === null) return;

      const currentY = e.touches[0].clientY;
      if (currentY > startY) {
        userScrolledUpRef.current = true;
      }
    };

    containerEl.addEventListener('wheel', handleWheel, { passive: true });
    containerEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    containerEl.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      containerEl.removeEventListener('wheel', handleWheel);
      containerEl.removeEventListener('touchstart', handleTouchStart);
      containerEl.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerEl]);

  // Initial load - force scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && !hasInitialScrolledRef.current && !isLoadingBot) {
      setTimeout(() => {
        forceScrollToBottom();
        hasInitialScrolledRef.current = true;
      }, 50);
    }
  }, [messages.length, isLoadingBot, forceScrollToBottom]);

  // Reset when bot changes
  useEffect(() => {
    if (isLoadingBot) {
      hasInitialScrolledRef.current = false;
      userScrolledUpRef.current = false;
    }
  }, [isLoadingBot]);

  // Handle new messages vs streaming content updates
  useEffect(() => {
    const messageCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    if (messageCount > prevCount) {
      forceScrollToBottom();
    } else {
      scrollToBottom();
    }

    prevMessageCountRef.current = messageCount;
  }, [messages, scrollToBottom, forceScrollToBottom]);

  // Subscribe to external scroll manager
  useEffect(() => {
    const unsubscribe = scrollManager.subscribe(scrollToBottom);
    return unsubscribe;
  }, [scrollToBottom]);

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

  if (messages.length === 0 && !isTyping) {
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
              roundedClass={roundedClass}
            />
          );
        })}

        {isTyping && messages[messages.length - 1]?.senderType !== 'ASSISTANT' && (
          <div className="mb-6 flex justify-start">
            <div
              className={`border-border bg-background text-foreground mr-4 border px-4 py-3 shadow-sm ${roundedClass}`}
            >
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
