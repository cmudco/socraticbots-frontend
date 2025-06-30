import React, { useEffect, useMemo, useRef, useState } from 'react';

import { MessageSquare } from 'lucide-react';

import {
  useClearConversation,
  useConversationForChapter,
  useStreamMessage,
} from '@/hooks/queries/useChat';

import { useChatStore } from '@/stores/chatStore';

import { Card } from '@/components/ui/card';
import ConfirmationModal from '@/components/ui/confirmation-modal';

import { ChatMessage, ChatRole, ChatSender } from '@/types/chat';

import ChatControls from './ChatControls';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

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

  const { data: conversation, isLoading: conversationLoading } =
    useConversationForChapter(selectedChapterId);
  const { streamMessage, isStreaming, error: streamError, tokens } = useStreamMessage();
  const clearConversationMutation = useClearConversation();

  const actualConversationId = conversation?.id;

  useEffect(() => {
    if (actualConversationId && actualConversationId !== selectedConversationId) {
      setSelectedConversationId(actualConversationId);
    }
  }, [actualConversationId, selectedConversationId, setSelectedConversationId]);

  const messages = useMemo(() => conversation?.messages || [], [conversation?.messages]);

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages, pendingMessages, isStreaming, tokens]);

  // Refocus input when streaming stops
  useEffect(() => {
    if (!isStreaming && inputRef.current) {
      // Small delay to ensure the UI has updated
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isStreaming]);

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
      <div className="flex h-full flex-1 flex-col bg-white">
        <ChatHeader />

        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md border-violet-200/50 bg-white/90 p-8 text-center shadow-lg backdrop-blur-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-400 shadow-sm">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-3 text-xl font-semibold text-slate-800">Please Select a Chapter</h2>
            <p className="leading-relaxed text-slate-600">
              Use the dropdown box along the top of the screen to select a chapter. Once you select
              a chapter, you can begin chatting.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const hasMessages = allMessages.length > 0;

  return (
    <div className="flex h-full flex-1 flex-col bg-white">
      {/* Chat Header */}
      <ChatHeader />

      {/* Message Area */}
      <div
        ref={messageAreaRef}
        className="flex-1 overflow-y-auto bg-gradient-to-br from-violet-50/30 via-white to-purple-50/30"
      >
        <div className="mx-auto max-w-5xl">
          {!hasMessages ? (
            <div className="px-6 py-8">
              <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-400 to-purple-400 shadow-lg">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-slate-800">Start a Conversation</h3>
                <p className="mb-8 max-w-md leading-relaxed text-slate-600">
                  Ask me anything about this chapter. I'm here to help you understand the concepts
                  and answer your questions.
                </p>

                {/* Quick Action Buttons */}
                <div className="grid w-full max-w-md grid-cols-1 gap-3 md:grid-cols-2">
                  <button
                    onClick={() =>
                      handleActionClick('Can you explain the main concepts in this chapter?')
                    }
                    className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/50"
                  >
                    <div className="mb-1 text-sm font-medium text-slate-800">Main Concepts</div>
                    <div className="text-xs text-slate-500">Explain key ideas</div>
                  </button>
                  <button
                    onClick={() => handleActionClick('Can you give me some examples?')}
                    className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/50"
                  >
                    <div className="mb-1 text-sm font-medium text-slate-800">Examples</div>
                    <div className="text-xs text-slate-500">Show practical examples</div>
                  </button>
                  <button
                    onClick={() => handleActionClick('Can you quiz me on this material?')}
                    className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/50"
                  >
                    <div className="mb-1 text-sm font-medium text-slate-800">Quiz Me</div>
                    <div className="text-xs text-slate-500">Test understanding</div>
                  </button>
                  <button
                    onClick={() => handleActionClick('Can you provide a summary?')}
                    className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/50"
                  >
                    <div className="mb-1 text-sm font-medium text-slate-800">Summary</div>
                    <div className="text-xs text-slate-500">Quick overview</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <MessageList
              messages={allMessages}
              greeting={
                conversation?.chapter_details && 'greeting' in conversation.chapter_details
                  ? conversation.chapter_details.greeting
                  : undefined
              }
              isStreaming={isStreaming}
            />
          )}
        </div>
      </div>

      {/* Show errors */}
      {(streamError || clearConversationMutation.isError) && (
        <div className="mx-4 mb-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start">
              <svg
                className="mt-0.5 mr-3 h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="mt-1 text-sm text-red-700">
                  {streamError?.message ||
                    (clearConversationMutation.error instanceof Error
                      ? clearConversationMutation.error.message
                      : 'An unexpected error occurred')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Controls - Only show when there are messages */}
      {hasMessages && (
        <div className="border-t border-slate-200/60 bg-white/90 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl">
            <ChatControls
              onActionClick={handleActionClick}
              onClearConversation={handleClearConversation}
              disabled={!selectedConversationId || conversationLoading || isStreaming}
            />
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
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
