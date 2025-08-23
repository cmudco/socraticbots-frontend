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
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'ml-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
            : 'mr-4 border border-slate-200 bg-white text-slate-800 shadow-sm'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex flex-col">
          {!isUser && (
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
                <span className="text-xs font-semibold text-white">AI</span>
              </div>
              <span className="text-xs font-medium text-slate-600">Assistant</span>
              {isStreaming && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
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
                      className="break-all text-blue-600 hover:text-blue-800"
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
                      className="not-prose rounded border border-slate-300 bg-slate-100 px-1 py-0.5 text-sm break-all text-slate-800"
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
                    <h1 className="mb-2 text-lg font-bold text-slate-800" {...props}>
                      {children}
                    </h1>
                  );
                },
                h2({ children, ...props }) {
                  return (
                    <h2 className="mb-2 text-base font-semibold text-slate-800" {...props}>
                      {children}
                    </h2>
                  );
                },
                h3({ children, ...props }) {
                  return (
                    <h3 className="mb-1 text-sm font-medium text-slate-800" {...props}>
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
                      className="my-2 border-l-4 border-slate-300 pl-4 text-slate-600 italic"
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
            <span className={`text-xs ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
              {new Date(message.date).toLocaleTimeString()}
            </span>

            <div className="flex items-center gap-2">
              {message.cost && !isUser && (
                <span className={`text-xs text-slate-400`}>
                  ${message.cost} • {message.inputTokens}/{message.outputTokens} tokens
                </span>
              )}

              <div
                className={`transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}
              >
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${isUser ? 'text-blue-100 hover:bg-blue-400/20 hover:text-white' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
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
