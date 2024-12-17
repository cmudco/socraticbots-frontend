import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                if (match) {
                  return (
                    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                }
                return (
                  <code className="bg-gray-200 px-1 rounded" {...props}>
                    {children}
                  </code>
                );
              },
              a({ node, children, ...props }) {
                return (
                  <a 
                    className="text-blue-500 hover:text-blue-700 underline" 
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
              ul({ node, children, ...props }) {
                return (
                  <ul className="list-disc list-inside my-2" {...props}>
                    {children}
                  </ul>
                );
              },
              ol({ node, children, ...props }) {
                return (
                  <ol className="list-decimal list-inside my-2" {...props}>
                    {children}
                  </ol>
                );
              },
              blockquote({ node, children, ...props }) {
                return (
                  <blockquote 
                    className="border-l-4 border-gray-300 pl-4 my-2 italic"
                    {...props}
                  >
                    {children}
                  </blockquote>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;