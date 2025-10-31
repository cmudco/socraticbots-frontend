import React from 'react';
import ReactMarkdown from 'react-markdown';

import 'highlight.js/styles/atom-one-light.css';
import 'katex/dist/katex.min.css';
import { Loader2 } from 'lucide-react';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { CodeBlock } from '@/components/chat/bot/CodeBlock';

import type { PublicBotMessage } from '@/types/publicBot';

interface PublicMessageBubbleProps {
  message: PublicBotMessage;
  isStreaming?: boolean;
}

const PublicMessageBubble: React.FC<PublicMessageBubbleProps> = ({
  message,
  isStreaming = false,
}) => {
  const isUser = message.senderType === 'USER';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`${isUser ? 'max-w-[80%]' : 'w-full'} rounded-2xl px-4 py-3 ${
          isUser
            ? 'from-primary to-primary/80 text-primary-foreground ml-4 bg-gradient-to-r shadow-md'
            : 'border-border bg-background text-foreground mr-4 border shadow-sm'
        }`}
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
                table({ children, ...props }) {
                  return (
                    <div className="max-w-full overflow-x-auto">
                      <table className="min-w-full" {...props}>
                        {children}
                      </table>
                    </div>
                  );
                },
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMessageBubble;
