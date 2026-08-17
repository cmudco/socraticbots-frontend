/**
 * Unified chat message bubble for the live chat surfaces.
 *
 * The authenticated chat ('app' variant) and the public bot chat
 * ('botTheme' variant, themable via the bot-* CSS variables) render the
 * same DOM with different styling. Tool-activity and trace chips mount
 * here once for every chat surface.
 */
import React, { useState } from 'react';

import { Loader2, Trash2 } from 'lucide-react';

import ToolActivity from '@/components/chat/toolActivity/ToolActivity';
import { Button } from '@/components/ui/button';

import type { ChatToolCall } from '@/types/toolCalls';

import MessageMarkdown from './MessageMarkdown';

export interface ChatBubbleMessage {
  id: string;
  message: string;
  senderType: 'USER' | 'ASSISTANT';
  date: string;
}

interface ChatMessageBubbleProps {
  message: ChatBubbleMessage;
  isStreaming?: boolean;
  variant?: 'app' | 'botTheme';
  /** botTheme variant only: bubble corner radius from the bot's theme. */
  roundedClass?: string;
  /** Renders a hover delete action when provided (authenticated chat). */
  onDelete?: (messageId: string) => Promise<void>;
  /** Tool-loop activity for this message (agentic retrieval etc.). */
  toolCalls?: ChatToolCall[];
}

const variantClasses = {
  app: {
    radius: 'rounded-2xl',
    user: 'from-primary to-primary/80 text-primary-foreground ml-4 bg-gradient-to-r shadow-md',
    assistant: 'border-border bg-background text-foreground mr-4 border shadow-sm',
    prose: 'prose prose-sm',
  },
  botTheme: {
    radius: '',
    user: 'bg-bot-primary ml-4 text-white shadow-md',
    assistant: 'bg-bot-accent text-bot-fg border-bot-accent mr-4 border shadow-sm',
    prose: 'prose',
  },
};

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isStreaming = false,
  variant = 'app',
  roundedClass = 'rounded-2xl',
  onDelete,
  toolCalls,
}) => {
  const isUser = message.senderType === 'USER';
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const classes = variantClasses[variant];
  const radius = variant === 'botTheme' ? roundedClass : classes.radius;

  const handleDelete = async () => {
    if (!message.id || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(message.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeleting(false);
      setShowActions(false);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group relative mb-6`}>
      <div
        className={`${isUser ? 'max-w-[80%]' : 'w-full'} px-4 py-3 ${radius} ${
          isUser ? classes.user : classes.assistant
        }`}
        onMouseEnter={onDelete ? () => setShowActions(true) : undefined}
        onMouseLeave={onDelete ? () => setShowActions(false) : undefined}
      >
        <div className="flex flex-col">
          {!isUser && (
            <div className="mb-2 flex items-center gap-2">
              <div className="from-secondary to-secondary/80 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br">
                <span className="text-secondary-foreground text-xs font-semibold">AI</span>
              </div>
              <span className="text-muted-foreground text-xs font-medium">Assistant</span>
              {isStreaming && <Loader2 className="text-primary h-3 w-3 animate-spin" />}
            </div>
          )}

          {!isUser && toolCalls && toolCalls.length > 0 && <ToolActivity toolCalls={toolCalls} />}

          <div className={`${classes.prose} max-w-none ${isStreaming ? 'animate-pulse' : ''}`}>
            <MessageMarkdown
              content={message.message}
              streaming={isStreaming}
              size={variant === 'app' ? 'sm' : 'base'}
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs ${isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
            >
              {new Date(message.date).toLocaleTimeString()}
            </span>

            {onDelete && (
              <div className="flex items-center gap-2">
                <div
                  className={`transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 ${isUser ? 'text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground' : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'}`}
                    title="Delete message"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
