// src/components/chat/MessageBubble.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import { ChatMessage } from '../../services/chat.service';

interface MessageBubbleProps {
  message: ChatMessage;
  isGreeting?: boolean;
  isPending?: boolean;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isGreeting = false,
  isPending = false,
  isStreaming = false
}) => {
  const isAssistant = message.role === 'assistant' || message.role === 'system';
  
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
          className="message-content" 
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
      );
    }

    // SPLIT INTO ASSISTANT VS USER MESSAGES
    console.log(message.content)
    if (isAssistant) {
      return (
        <div className="prose prose-sm max-w-none space-y-8">
          <ReactMarkdown 
            components={{
              h1: ({children}) => <h1 className="text-xl font-bold mt-1 mb-1 border-b pb-2">{children}</h1>,
              h2: ({children}) => <h2 className="text-lg font-semibold mt-1 mb-1 border-b pb-2">{children}</h2>,
              ul: ({children}) => <ul className="mt-1 mb-1 space-y-2 list-disc pl-5">{children}</ul>,
              ol: ({children}) => <ol className="mt-1 mb-1 space-y-2 list-decimal pl-5">{children}</ol>,
              h3: ({children}) => <h3 className="text-lg font-semibold mt-1 mb-1 border-b pb-2">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-1 h-4 ml-1 bg-current animate-blink">|</span>
          )}
        </div>
      );
    }
    
    // Regular user messages get basic markdown
    return (
      <div className="markdown-content">
        <ReactMarkdown>
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };
  
  return (
    <div className={`flex items-start mb-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {/* Avatar for assistant */}
      {isAssistant && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
            {isStreaming ? (
              // Spinning indicator for streaming
              <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'AI'}
          </div>
        </div>
      )}
      
      <div 
        className={`
          relative max-w-3/4 
          ${isAssistant ? 'bg-gray-100 text-gray-800' : 'bg-purple-600 text-white'} 
          ${isPending ? 'opacity-70' : ''} 
          ${isStreaming ? 'animate-pulse-subtle' : ''} 
          rounded-lg px-4 py-2
        `}
      >
        {/* Render content using our helper function */}
        {renderContent()}
        
        {/* Show status indicators */}
        {(isPending || isStreaming) && (
          <span className="ml-2 text-xs text-gray-400">
            {isPending ? '(sending...)' : isStreaming ? '(typing...)' : ''}
          </span>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isAssistant ? 'text-gray-500' : 'text-purple-200'}`}>
          {isGreeting ? 'Greeting' : formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </div>
        
        {/* Action buttons - only for completed messages */}
        {!isGreeting && !isStreaming && !isPending && (
          <div className="absolute -bottom-6 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAssistant && (
              <>
                <button className="text-gray-400 hover:text-gray-600" title="Copy to clipboard">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-gray-600" title="Regenerate">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Avatar for user */}
      {!isAssistant && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
            You
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
