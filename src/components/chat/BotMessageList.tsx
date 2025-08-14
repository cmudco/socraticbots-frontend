import React, { useEffect, useRef } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { DareMessage } from '@/services/conversation.service';
import { useMessages, useIsTyping, useConversationStore } from '@/stores/core/conversationStore';

interface BotMessageListProps {
  className?: string;
}

const MessageBubble: React.FC<{ message: DareMessage; isStreaming?: boolean }> = ({ 
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
          
          <div className="prose prose-sm max-w-none">
            <p className="text-sm whitespace-pre-wrap leading-relaxed m-0">
              {message.message}
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

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start mb-6">
    <div className="bg-white border border-slate-200 max-w-[80%] rounded-2xl px-4 py-3 mr-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-slate-600">Assistant is thinking...</span>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC = () => {
  const { currentBotId } = useConversationStore();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg">
        <MessageSquare className="h-10 w-10 text-white" />
      </div>
      <h3 className="mb-4 text-2xl font-semibold text-slate-800">Start a Conversation</h3>
      <p className="mb-8 max-w-md leading-relaxed text-slate-600">
        Ready to chat with Bot {currentBotId}! Ask me anything and I'll help you learn through our Socratic dialogue.
      </p>
    
    <div className="grid w-full max-w-md grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
        <div className="mb-1 text-sm font-medium text-slate-800">Ask Questions</div>
        <div className="text-xs text-slate-500">I'll guide you through learning</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
        <div className="mb-1 text-sm font-medium text-slate-800">Explore Ideas</div>
        <div className="text-xs text-slate-500">Let's think together</div>
      </div>
    </div>
    </div>
  );
};

const BotMessageList: React.FC<BotMessageListProps> = ({ 
  className = ''
}) => {
  const messages = useMessages();
  const isStreaming = useIsTyping();
  const { isLoadingMessages } = useConversationStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isStreaming]);

  if (isLoadingMessages) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-slate-600">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/30 via-white to-blue-50/20 ${className}`}
    >
      <div className="mx-auto max-w-4xl px-4 py-6">
        {messages.map((message, index) => {
          const isLastAssistantMessage = 
            message.senderType === 'ASSISTANT' && 
            index === messages.length - 1;
          
          return (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isStreaming={isStreaming && isLastAssistantMessage}
            />
          );
        })}
        
        {isStreaming && messages[messages.length - 1]?.senderType !== 'ASSISTANT' && (
          <TypingIndicator />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default BotMessageList;