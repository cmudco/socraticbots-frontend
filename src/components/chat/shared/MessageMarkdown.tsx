/**
 * Shared markdown renderer for chat messages.
 *
 * `full` is the live-chat pipeline (GFM, math, syntax highlighting, raw HTML)
 * used by the authenticated and public chat bubbles. `basic` is the lighter
 * read-only pipeline used by the professor conversation slide-overs, with
 * `inverted` styling for user-side bubbles.
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';

import 'highlight.js/styles/atom-one-light.css';
import 'katex/dist/katex.min.css';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { CodeBlock } from '@/components/chat/bot/CodeBlock';

interface MessageMarkdownProps {
  content: string;
  /** Appends the streaming cursor glyph. */
  streaming?: boolean;
  /** 'sm' renders text-sm paragraphs (authenticated chat); 'base' matches the public bubble. */
  size?: 'sm' | 'base';
  /** Feature set: 'full' for live chat, 'basic' for read-only transcripts. */
  features?: 'full' | 'basic';
  /** Basic variant only: styles code/links/quotes for on-primary (user) bubbles. */
  inverted?: boolean;
}

const listComponents = {
  ul({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) {
    return (
      <ul className="mb-2 list-inside list-disc space-y-1" {...props}>
        {children}
      </ul>
    );
  },
  ol({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) {
    return (
      <ol className="mb-2 list-inside list-decimal space-y-1" {...props}>
        {children}
      </ol>
    );
  },
  li({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) {
    return (
      <li className="text-sm leading-relaxed" {...props}>
        {children}
      </li>
    );
  },
};

const MessageMarkdown: React.FC<MessageMarkdownProps> = ({
  content,
  streaming = false,
  size = 'sm',
  features = 'full',
  inverted = false,
}) => {
  if (features === 'basic') {
    return (
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
                className={`break-all ${inverted ? 'text-primary-foreground/90 underline' : 'text-primary hover:text-primary/80'}`}
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
                  inverted
                    ? 'bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground'
                    : 'bg-muted border-border text-foreground'
                } ${className || ''}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className={`my-2 border-l-4 pl-4 italic ${
                  inverted
                    ? 'border-primary-foreground/50 text-primary-foreground/80'
                    : 'border-border text-muted-foreground'
                }`}
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          ...listComponents,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  return (
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
            <pre className="max-w-full overflow-x-auto break-words whitespace-pre-wrap" {...props}>
              {children}
            </pre>
          );
        },
        p({ children, ...props }) {
          return (
            <p
              className={`m-0 leading-relaxed break-words whitespace-pre-wrap ${size === 'sm' ? 'text-sm' : ''}`}
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
              className="text-primary hover:text-primary/80 break-all"
              style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
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
              style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
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
        ...listComponents,
      }}
    >
      {streaming ? `${content}▋` : content}
    </ReactMarkdown>
  );
};

export default MessageMarkdown;
