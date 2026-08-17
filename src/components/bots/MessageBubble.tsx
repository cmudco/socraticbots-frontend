import React from 'react';

import { ConversationMessage } from '@/services/botAccess.service';

import { formatTime } from '@/utils/formatters';

import MessageMarkdown from '@/components/chat/shared/MessageMarkdown';

interface MessageBubbleProps {
  message: ConversationMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="mr-2 flex-shrink-0">
          <div className="bg-secondary dark:bg-secondary/80 flex h-7 w-7 items-center justify-center rounded-full shadow-sm">
            <span className="text-secondary-foreground text-xs font-semibold">AI</span>
          </div>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-card dark:bg-card/80 border-border text-card-foreground border shadow-sm'
        }`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MessageMarkdown content={message.content} features="basic" inverted={isUser} />
        </div>

        <div className={`mt-1 ${isUser ? 'text-right' : ''}`}>
          <span
            className={`text-[10px] ${
              isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
            }`}
          >
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>

      {/* Spacer for user messages */}
      {isUser && <div className="w-7 flex-shrink-0" />}
    </div>
  );
};

export default MessageBubble;
