import React from 'react';
import ReactMarkdown from 'react-markdown';

import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { ConversationMessage } from '@/services/botAccess.service';

import { formatTime } from '@/utils/formatters';

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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p({ children, ...props }) {
                return (
                  <p
                    className="m-0 text-sm leading-relaxed break-words whitespace-pre-wrap"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    {...props}
                  >
                    {children}
                  </p>
                );
              },
              a({ children, href, ...props }) {
                return (
                  <a
                    href={href}
                    className={`break-all ${isUser ? 'text-primary-foreground/90 underline' : 'text-primary hover:text-primary/80'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
              code({ className, children, ...props }) {
                return (
                  <code
                    className={`not-prose rounded border px-1 py-0.5 text-sm break-all ${
                      isUser
                        ? 'bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground'
                        : 'bg-muted border-border text-foreground'
                    } ${className || ''}`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              ul({ children, ...props }) {
                return (
                  <ul className="mb-2 list-inside list-disc space-y-1" {...props}>
                    {children}
                  </ul>
                );
              },
              ol({ children, ...props }) {
                return (
                  <ol className="mb-2 list-inside list-decimal space-y-1" {...props}>
                    {children}
                  </ol>
                );
              },
              li({ children, ...props }) {
                return (
                  <li className="text-sm leading-relaxed" {...props}>
                    {children}
                  </li>
                );
              },
              blockquote({ children, ...props }) {
                return (
                  <blockquote
                    className={`my-2 border-l-4 pl-4 italic ${
                      isUser
                        ? 'border-primary-foreground/50 text-primary-foreground/80'
                        : 'border-border text-muted-foreground'
                    }`}
                    {...props}
                  >
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
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
