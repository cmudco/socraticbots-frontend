import React from 'react';
import { Loader2 } from 'lucide-react';
import { DareMessage } from '@/services/conversation.service';

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
            <p className="text-sm whitespace-pre-wrap leading-relaxed m-0">
              {isStreaming ? `${message.message}\u258b` : message.message}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
              {new Date(message.date).toLocaleTimeString()}
            </span>
            
            {message.cost && (
              <span className={`text-xs ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
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