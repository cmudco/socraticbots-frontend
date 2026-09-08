import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';

import {
  useConversationStore,
  useIsLoadingBot,
  useMessages,
} from '@/stores/core/conversationStore';
import { useWebSocketStore } from '@/stores/core/websocketStore';

import { scrollManager } from '@/utils/scrollManager';

import ChatMessageBubble from '@/components/chat/shared/ChatMessageBubble';

import EmptyState from './EmptyState';
import TypingIndicator from './TypingIndicator';

interface BotMessageListProps {
  className?: string;
}

const BotMessageList: React.FC<BotMessageListProps> = ({ className = '' }) => {
  const messages = useMessages();
  const isLoadingBot = useIsLoadingBot();
  const { isLoadingMessages, isTyping, deleteMessage } = useConversationStore();
  const { toolCallsByMessage, contextTraceByMessage } = useWebSocketStore();
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

  // Force scroll to bottom (used for new messages only)
  const forceScrollToBottom = useCallback((shouldResetFlag = true) => {
    const anchor = messagesEndRef.current;
    if (!anchor) return;
    if (shouldResetFlag) {
      userScrolledUpRef.current = false;
    }
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
      // deltaY < 0 = scrolling UP
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
    if (messages.length > 0 && !hasInitialScrolledRef.current && !isLoadingMessages) {
      setTimeout(() => {
        forceScrollToBottom(true);
        hasInitialScrolledRef.current = true;
      }, 50);
    }
  }, [messages.length, isLoadingMessages, forceScrollToBottom]);

  // Reset when conversation changes
  useEffect(() => {
    if (isLoadingMessages) {
      hasInitialScrolledRef.current = false;
      userScrolledUpRef.current = false;
    }
  }, [isLoadingMessages]);

  // Handle new messages vs streaming content updates
  useEffect(() => {
    const messageCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    // NEW message added = force scroll (user sent a message or got a new response)
    if (messageCount > prevCount) {
      forceScrollToBottom(true);
    } else {
      // Same message count = content update (streaming) - respect user scroll
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

  if (messages.length === 0 && !isTyping) {
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
            <ChatMessageBubble
              key={message.id}
              message={message}
              isStreaming={message.streaming}
              onDelete={deleteMessage}
              toolCalls={
                message.toolCalls?.length
                  ? message.toolCalls
                  : toolCallsByMessage[String(message.id)]
              }
              contextTrace={message.contextTrace ?? contextTraceByMessage[String(message.id)]}
            />
          );
        })}

        {isTyping && messages[messages.length - 1]?.senderType !== 'ASSISTANT' && (
          <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default BotMessageList;
