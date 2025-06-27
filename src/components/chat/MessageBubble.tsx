// src/components/chat/MessageBubble.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import DOMPurify from 'dompurify';
import type { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isGreeting?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGreeting = false
}) => {
  const isAssistant = message.sender === 'assistant';

  // Function to render content based on type (HTML for greeting, Markdown for messages)
  const renderContent = () => {
    // For greeting messages, sanitize and render HTML
    if (isGreeting) {
      const sanitizedHTML = DOMPurify.sanitize(message.content, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: [
          'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
          'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'blockquote', 'hr', 'br'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel']
      });

      return (
        <div
          className="message-content leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
      );
    }

    // Assistant messages
    if (isAssistant) {
      return (
        <div className="prose prose-sm max-w-none leading-relaxed">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-3 border-b pb-2 text-gray-900">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-3 border-b pb-2 text-gray-800">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-2 text-gray-800">{children}</h3>,
              ul: ({ children }) => <ul className="mt-3 mb-3 space-y-2 list-disc pl-6">{children}</ul>,
              ol: ({ children }) => <ol className="mt-3 mb-3 space-y-2 list-decimal pl-6">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              p: ({ children }) => <p className="mb-3 leading-relaxed text-gray-800 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
              code: ({ children }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>,
              pre: ({ children }) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-3">{children}</pre>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      );
    }

    // Regular user messages get basic markdown
    return (
      <div className="markdown-content leading-relaxed">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="last:mb-0">{children}</p>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`flex items-start ${isAssistant ? 'mb-4' : 'mb-8'} ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {/* Avatar for assistant */}
      {isAssistant && (
        <div className="flex-shrink-0 mr-4 mt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-medium shadow-lg">
            AI
          </div>
        </div>
      )}

      <div
        className={`
          relative shadow-sm border
          ${isAssistant
            ? 'max-w-[90%] bg-white text-gray-800 border-gray-200 rounded-2xl rounded-tl-md'
            : 'max-w-[70%] bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600 rounded-2xl rounded-tr-md'
          }
          ${isAssistant ? 'px-6 py-5' : 'px-5 py-3'}
        `}
      >
        {/* Render content using our helper function */}
        {renderContent()}

        {/* Timestamp */}
        <div className={`text-xs ${isAssistant ? 'mt-3' : 'mt-1'} flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
          <span className={`${isAssistant ? 'text-gray-500' : 'text-purple-200'} font-medium`}>
            {isGreeting
              ? 'Greeting'
              : (() => {
                if (message.timestamp) {
                  const date = typeof message.timestamp === 'string' ? parseISO(message.timestamp) : new Date(message.timestamp);
                  if (isValid(date)) {
                    return formatDistanceToNow(date, { addSuffix: true });
                  }
                }
                return '';
              })()}
          </span>
        </div>
      </div>

      {/* Avatar for user */}
      {!isAssistant && (
        <div className="flex-shrink-0 ml-4 mt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-medium shadow-lg">
            You
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
