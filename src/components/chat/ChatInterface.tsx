import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useConversationForChapter, useStreamMessage, useClearConversation } from '@/hooks/queries/useChat';
import ChatHeader from './ChatHeader';
import ChatControls from './ChatControls';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { ChatMessage, ChatRole, ChatSender } from '@/types/chat';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import ConfirmationModal from '@/components/ui/confirmation-modal';

const ChatInterface: React.FC = () => {
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null!);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const {
    selectedChapterId,
    selectedConversationId,
    setSelectedConversationId,
    inputValue,
    setInputValue,
    pendingMessages,
    addPendingMessage,
    removePendingMessage,
  } = useChatStore();

  const { data: conversation, isLoading: conversationLoading } = useConversationForChapter(selectedChapterId);
  const { streamMessage, isStreaming, error: streamError, tokens } = useStreamMessage();
  const clearConversationMutation = useClearConversation();

  const actualConversationId = conversation?.id;

  useEffect(() => {
    if (actualConversationId && actualConversationId !== selectedConversationId) {
      setSelectedConversationId(actualConversationId);
    }
  }, [actualConversationId, selectedConversationId, setSelectedConversationId]);

  const messages = conversation?.messages || [];

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages, pendingMessages, isStreaming, tokens]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !actualConversationId || conversationLoading || isStreaming) return;

    const messageToSend = inputValue.trim();
    setInputValue('');

    // Create a pending message
    const pendingId = `pending-${Date.now()}`;
    const pendingMessage: ChatMessage = {
      id: pendingId,
      conversation: actualConversationId,
      role: 'user' as ChatRole,
      content: messageToSend,
      created_at: new Date().toISOString(),
      sender: 'user' as ChatSender,
      timestamp: new Date().toISOString(),
    };
    addPendingMessage(pendingMessage);

    try {
      await streamMessage({ conversationId: actualConversationId, content: messageToSend });
      removePendingMessage(pendingId);
    } catch {
      removePendingMessage(pendingId);
    }
  };

  const handleStopStreaming = () => {
    // Note: Current implementation doesn't support stopping
    console.log('Stop streaming requested');
  };

  const handleActionClick = (message: string) => {
    if (!actualConversationId || conversationLoading || isStreaming) return;
    setInputValue(message);
  };

  const handleClearConversation = () => {
    if (!actualConversationId) return;
    setShowClearConfirmation(true);
  };

  const handleConfirmClearConversation = () => {
    if (!actualConversationId) return;
    clearConversationMutation.mutate(actualConversationId);
  };

  // Merge messages with pending and streaming tokens
  const allMessages = [...messages, ...pendingMessages];

  // Add streaming message if streaming
  if (isStreaming && tokens.length > 0) {
    allMessages.push({
      id: `streaming-${Date.now()}`,
      conversation: actualConversationId || '',
      role: 'assistant' as ChatRole,
      content: tokens.join(''),
      created_at: new Date().toISOString(),
      sender: 'assistant' as ChatSender,
      timestamp: new Date().toISOString(),
    });
  }

  // Empty state when no chapter is selected
  if (!selectedChapterId) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white">
        <ChatHeader />

        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full p-8 text-center bg-white/90 backdrop-blur-sm border-violet-200/50 shadow-lg">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-violet-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-sm">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-slate-800">Please Select a Chapter</h2>
            <p className="text-slate-600 leading-relaxed">
              Use the dropdown box along the top of the screen to select a chapter. Once you select a chapter, you can
              begin chatting.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const hasMessages = allMessages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Chat Header */}
      <ChatHeader />

      {/* Message Area */}
      <div ref={messageAreaRef} className="flex-1 overflow-y-auto bg-gradient-to-br from-violet-50/30 via-white to-purple-50/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-20 h-20 mb-8 bg-gradient-to-br from-violet-400 to-purple-400 rounded-3xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">Start a Conversation</h3>
              <p className="text-slate-600 max-w-md leading-relaxed mb-8">
                Ask me anything about this chapter. I'm here to help you understand the concepts and answer your questions.
              </p>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                <button
                  onClick={() => handleActionClick("Can you explain the main concepts in this chapter?")}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-200 text-left group"
                >
                  <div className="text-sm font-medium text-slate-800 mb-1">Main Concepts</div>
                  <div className="text-xs text-slate-500">Explain key ideas</div>
                </button>
                <button
                  onClick={() => handleActionClick("Can you give me some examples?")}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-200 text-left group"
                >
                  <div className="text-sm font-medium text-slate-800 mb-1">Examples</div>
                  <div className="text-xs text-slate-500">Show practical examples</div>
                </button>
                <button
                  onClick={() => handleActionClick("Can you quiz me on this material?")}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-200 text-left group"
                >
                  <div className="text-sm font-medium text-slate-800 mb-1">Quiz Me</div>
                  <div className="text-xs text-slate-500">Test understanding</div>
                </button>
                <button
                  onClick={() => handleActionClick("Can you provide a summary?")}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-200 text-left group"
                >
                  <div className="text-sm font-medium text-slate-800 mb-1">Summary</div>
                  <div className="text-xs text-slate-500">Quick overview</div>
                </button>
              </div>
            </div>
          ) : (
            <MessageList
              messages={allMessages}
              greeting={conversation?.chapter_details && 'greeting' in conversation.chapter_details ? conversation.chapter_details.greeting : undefined}
              isStreaming={isStreaming}
            />
          )}
        </div>
      </div>

      {/* Show errors */}
      {(streamError || clearConversationMutation.isError) && (
        <div className="mx-4 mb-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-red-800 font-medium">Error</h4>
                <p className="text-red-700 text-sm mt-1">
                  {streamError?.message || (clearConversationMutation.error instanceof Error ? clearConversationMutation.error.message : 'An unexpected error occurred')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Controls - Only show when there are messages */}
      {hasMessages && (
        <div className="border-t border-slate-200/60 bg-white/90 backdrop-blur-sm px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <ChatControls
              onActionClick={handleActionClick}
              onClearConversation={handleClearConversation}
              disabled={!selectedConversationId || conversationLoading || isStreaming}
            />
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="bg-white border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            onStop={handleStopStreaming}
            disabled={!selectedConversationId || conversationLoading || isStreaming}
            isStreaming={isStreaming}
            inputRef={inputRef}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleConfirmClearConversation}
        title="Clear Conversation"
        description="Are you sure you want to clear this conversation? This action cannot be undone and all messages will be permanently deleted."
        confirmText="Clear Conversation"
        cancelText="Cancel"
        variant="destructive"
        isLoading={clearConversationMutation.isPending}
      />
    </div>
  );
};

export default ChatInterface;
