import React from 'react';
import ReactMarkdown from 'react-markdown';

import DOMPurify from 'dompurify';

import AnimatedDots from '@/components/chat/AnimatedDots';

import { ChatSender } from '@/types/chat';

interface MessageRendererProps {
  content: string;
  sender: ChatSender;
  isGreeting?: boolean;
  isStreaming?: boolean;
}

/**
 * Renders message content based on sender type and message format
 * Handles HTML sanitization for greetings, rich markdown for assistants, and basic markdown for users
 */
export const renderMessageContent = ({
  content,
  sender,
  isGreeting = false,
  isStreaming = false,
}: MessageRendererProps): React.ReactElement => {
  const isAssistant = sender === 'assistant';

  // For greeting messages, sanitize and render HTML
  if (isGreeting) {
    const sanitizedHTML = DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'p',
        'b',
        'i',
        'em',
        'strong',
        'a',
        'ul',
        'ol',
        'li',
        'code',
        'pre',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'hr',
        'br',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });

    return (
      <div
        className="message-content leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    );
  }

  // Assistant messages get rich markdown rendering
  if (isAssistant) {
    return (
      <div className="max-w-none leading-relaxed">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="mt-4 mb-2 border-b pb-2 text-xl font-bold text-gray-900 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="mt-4 mb-2 border-b pb-2 text-lg font-semibold text-gray-800 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-3 mb-2 text-base font-semibold text-gray-800 first:mt-0">
                {children}
              </h3>
            ),
            ul: ({ children }) => (
              <ul className="my-2 list-disc space-y-1 pl-6 first:mt-0 last:mb-0">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-2 list-decimal space-y-1 pl-6 first:mt-0 last:mb-0">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            p: ({ children }) => (
              <p className="mb-2 leading-relaxed text-gray-800 first:mt-0 last:mb-0">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">{children}</strong>
            ),
            code: ({ children }) => (
              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="my-2 overflow-x-auto rounded-lg bg-gray-100 p-4 first:mt-0 last:mb-0">
                {children}
              </pre>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && <AnimatedDots className="mt-2 ml-2 align-middle" />}
      </div>
    );
  }

  // Regular user messages get simple text rendering (no markdown to avoid wrapping issues)
  return <div className="leading-relaxed">{content}</div>;
};
