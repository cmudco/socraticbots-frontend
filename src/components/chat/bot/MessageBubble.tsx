import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import 'highlight.js/styles/atom-one-light.css';
import 'katex/dist/katex.min.css';
import { Loader2, Trash2 } from 'lucide-react';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { useConversationStore } from '@/stores/core/conversationStore';

import { DareMessage } from '@/services/conversation.service';

import { Button } from '@/components/ui/button';

import { CodeBlock } from './CodeBlock';

interface MessageBubbleProps {
  message: DareMessage;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.senderType === 'USER';
  const { deleteMessage } = useConversationStore();
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!message.id) return;

    setIsDeleting(true);
    try {
      await deleteMessage(message.id);
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
        className={`${isUser ? 'max-w-[80%]' : 'w-full'} rounded-2xl px-4 py-3 ${
          isUser
            ? 'from-primary to-primary/80 text-primary-foreground ml-4 bg-gradient-to-r shadow-md'
            : 'border-border bg-background text-foreground mr-4 border shadow-sm'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
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

          <div className={`prose prose-sm max-w-none ${isStreaming ? 'animate-pulse' : ''}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
              components={{
                // Handle tables
                table({ children, ...props }) {
                  return (
                    <div className="max-w-full overflow-x-auto">
                      <table className="min-w-full" {...props}>
                        {children}
                      </table>
                    </div>
                  );
                },
                // Handle pre blocks
                pre({ children, ...props }) {
                  return (
                    <pre
                      className="max-w-full overflow-x-auto break-words whitespace-pre-wrap"
                      {...props}
                    >
                      {children}
                    </pre>
                  );
                },
                // Handle paragraphs
                p({ children, ...props }) {
                  return (
                    <p
                      className="m-0 text-sm leading-relaxed break-words whitespace-pre-wrap"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                      {...props}
                    >
                      {children}
                    </p>
                  );
                },
                // Handle links to prevent long URLs from overflowing
                a({ children, href, ...props }) {
                  return (
                    <a
                      href={href}
                      className="text-primary hover:text-primary/80 break-all"
                      style={{
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                      }}
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                // Handle inline code
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  if (match) {
                    return (
                      <CodeBlock className={className} props={props}>
                        {children}
                      </CodeBlock>
                    );
                  }
                  return (
                    <code
                      className="not-prose border-border bg-muted text-foreground rounded border px-1 py-0.5 text-sm break-all"
                      style={{
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                // Handle headers
                h1({ children, ...props }) {
                  return (
                    <h1 className="text-foreground mb-2 text-lg font-bold" {...props}>
                      {children}
                    </h1>
                  );
                },
                h2({ children, ...props }) {
                  return (
                    <h2 className="text-foreground mb-2 text-base font-semibold" {...props}>
                      {children}
                    </h2>
                  );
                },
                h3({ children, ...props }) {
                  return (
                    <h3 className="text-foreground mb-1 text-sm font-medium" {...props}>
                      {children}
                    </h3>
                  );
                },
                // Handle lists
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
                // Handle blockquotes
                blockquote({ children, ...props }) {
                  return (
                    <blockquote
                      className="border-border text-muted-foreground my-2 border-l-4 pl-4 italic"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {isStreaming ? `${message.message}\u258b` : message.message}
            </ReactMarkdown>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs ${isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
            >
              {new Date(message.date).toLocaleTimeString()}
            </span>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
