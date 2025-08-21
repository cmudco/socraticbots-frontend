import React from 'react';
import { Loader2 } from 'lucide-react';
import { DareMessage } from '@/services/conversation.service';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './CodeBlock';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-light.css';

interface MessageBubbleProps {
  message: DareMessage;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isStreaming = false 
}) => {
  const isUser = message.senderType === 'USER';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-4 shadow-md'
            : 'bg-white border border-slate-200 text-slate-800 mr-4 shadow-sm'
        }`}
      >
        <div className="flex flex-col">
          {!isUser && (
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
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
                    <div className='max-w-full overflow-x-auto'>
                      <table className='min-w-full' {...props}>
                        {children}
                      </table>
                    </div>
                  )
                },
                // Handle pre blocks
                pre({ children, ...props }) {
                  return (
                    <pre
                      className='max-w-full overflow-x-auto whitespace-pre-wrap break-words'
                      {...props}
                    >
                      {children}
                    </pre>
                  )
                },
                // Handle paragraphs
                p({ children, ...props }) {
                  return (
                    <p
                      className='break-words text-sm whitespace-pre-wrap leading-relaxed m-0'
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                      {...props}
                    >
                      {children}
                    </p>
                  )
                },
                // Handle links to prevent long URLs from overflowing
                a({ children, href, ...props }) {
                  return (
                    <a
                      href={href}
                      className='break-all text-blue-600 hover:text-blue-800'
                      style={{
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                      }}
                      {...props}
                    >
                      {children}
                    </a>
                  )
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
                      className='not-prose break-all rounded border border-slate-300 bg-slate-100 px-1 py-0.5 text-sm text-slate-800'
                      style={{
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                // Handle headers
                h1({ children, ...props }) {
                  return (
                    <h1 className='text-lg font-bold text-slate-800 mb-2' {...props}>
                      {children}
                    </h1>
                  )
                },
                h2({ children, ...props }) {
                  return (
                    <h2 className='text-base font-semibold text-slate-800 mb-2' {...props}>
                      {children}
                    </h2>
                  )
                },
                h3({ children, ...props }) {
                  return (
                    <h3 className='text-sm font-medium text-slate-800 mb-1' {...props}>
                      {children}
                    </h3>
                  )
                },
                // Handle lists
                ul({ children, ...props }) {
                  return (
                    <ul className='list-disc list-inside space-y-1 mb-2' {...props}>
                      {children}
                    </ul>
                  )
                },
                ol({ children, ...props }) {
                  return (
                    <ol className='list-decimal list-inside space-y-1 mb-2' {...props}>
                      {children}
                    </ol>
                  )
                },
                li({ children, ...props }) {
                  return (
                    <li className='text-sm leading-relaxed' {...props}>
                      {children}
                    </li>
                  )
                },
                // Handle blockquotes
                blockquote({ children, ...props }) {
                  return (
                    <blockquote className='border-l-4 border-slate-300 pl-4 italic text-slate-600 my-2' {...props}>
                      {children}
                    </blockquote>
                  )
                },
              }}
            >
              {isStreaming ? `${message.message}\u258b` : message.message}
            </ReactMarkdown>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
              {new Date(message.date).toLocaleTimeString()}
            </span>
            
            {message.cost && !isUser && (
              <span className={`text-xs text-slate-400`}>
                ${message.cost} • {message.inputTokens}/{message.outputTokens} tokens
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;