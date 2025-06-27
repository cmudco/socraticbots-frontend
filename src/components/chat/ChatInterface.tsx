import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useConversationForChapter, useStreamMessage, useClearConversation } from '@/hooks/queries/useChat';
import ChatControls from './ChatControls';
import MessageList from './MessageList';
import { ChatMessage, ChatRole, ChatSender } from '@/types/chat';

const ChatInterface: React.FC = () => {
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

  const {
    data: conversation,
    isLoading: conversationLoading,
    error: conversationError,
  } = useConversationForChapter(selectedChapterId);

  const { streamMessage, isStreaming, error: streamError, tokens: streamedTokens } = useStreamMessage();
  const clearConversationMutation = useClearConversation();

  const messageInputRef = useRef<HTMLInputElement>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);

  // Focus the input field when a chapter is selected
  useEffect(() => {
    if (selectedConversationId && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedConversationId]);

  // When conversation is fetched, update selectedConversationId
  React.useEffect(() => {
    if (conversation && selectedConversationId !== conversation.id) {
      setSelectedConversationId(conversation.id);
    }
  }, [conversation, selectedConversationId, setSelectedConversationId]);

  // Handle sending a message (streaming)
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedConversationId || !conversation) return;
    const messageToSend = inputValue.trim();
    setInputValue('');

    // Restore focus to input immediately after clearing
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }, 0);

    // Create a pending message
    const pendingId = `pending-${Date.now()}`;
    const pendingMessage: ChatMessage = {
      id: pendingId,
      conversation: conversation.id,
      role: ChatRole.USER,
      content: messageToSend,
      created_at: new Date().toISOString(),
      sender: ChatSender.USER,
      timestamp: new Date().toISOString(),
    };
    addPendingMessage(pendingMessage);
    await streamMessage(
      { conversationId: conversation.id, content: messageToSend }
    );
    removePendingMessage(pendingId);

    // Restore focus after streaming completes
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }, 100);
  };

  // Handle action button click - sets the message but doesn't send
  const handleActionClick = (actionMessage: string) => {
    setInputValue(actionMessage);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  // Handle clear conversation
  const handleClearConversation = () => {
    if (!conversation) return;
    if (window.confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
      clearConversationMutation.mutate(conversation.id);
    }
  };

  // Handle keypress for sending message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Merge confirmed, pending, and streamed messages
  const mergedMessages: ChatMessage[] = [
    ...(conversation?.messages || []),
    ...pendingMessages,
  ];
  // If streaming, add a temporary assistant message with streamedTokens
  if (isStreaming && streamedTokens.length > 0) {
    mergedMessages.push({
      id: `streaming-${Date.now()}`,
      conversation: conversation?.id,
      role: ChatRole.ASSISTANT,
      content: streamedTokens.join(''),
      created_at: new Date().toISOString(),
      sender: ChatSender.ASSISTANT,
      timestamp: new Date().toISOString(),
    });
  }

  // Render the appropriate content based on state
  const renderContent = () => {
    if (!selectedConversationId) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 mt-8">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-xl font-medium mb-2">Please Select a Chapter</p>
          <p className="text-center max-w-md">Use the dropdown box along the top of the screen to select a chapter. Once you select a chapter, you can begin chatting.</p>
        </div>
      );
    }
    if (conversationLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      );
    }
    if (conversationError) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{conversationError instanceof Error ? conversationError.message : String(conversationError)}</p>
        </div>
      );
    }
    if (conversation) {
      return (
        <MessageList
          messages={mergedMessages}
          greeting={conversation.chapter_details && 'greeting' in conversation.chapter_details ? conversation.chapter_details.greeting : undefined}
        />
      );
    }
    return null;
  };

  const scrollToBottom = () => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when conversation changes
  useEffect(() => {
    scrollToBottom();
  }, [conversation, pendingMessages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Message Area */}
      <div ref={messageAreaRef} className="flex-1 overflow-y-auto px-4 pb-4 scroll-smooth">
        {renderContent()}
        {/* Show message error if there is one */}
        {(streamError || clearConversationMutation.isError) && (
          <div className="p-3 bg-red-100 text-red-800 rounded-md mt-2 mx-auto max-w-md">
            <p>Error: {streamError?.message || (clearConversationMutation.error instanceof Error ? clearConversationMutation.error.message : 'Unknown error')}</p>
          </div>
        )}
      </div>
      {/* Input Area with new buttons */}
      <div className="border-t border-gray-200 py-3 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <ChatControls
            onActionClick={handleActionClick}
            onClearConversation={handleClearConversation}
            disabled={!selectedConversationId || conversationLoading || isStreaming}
          />
          <form onSubmit={(e) => { e.preventDefault(); }} className="flex items-center border rounded-md">
            <input
              ref={messageInputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isStreaming
                  ? "AI is responding..."
                  : selectedConversationId
                    ? "Type your message..."
                    : "Please select a chapter first"
              }
              className="flex-grow px-4 py-2 focus:outline-none"
              disabled={!selectedConversationId || conversationLoading || isStreaming}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className={`px-4 py-2 ${inputValue.trim() && selectedConversationId && !isStreaming
                ? 'text-purple-600 hover:text-purple-700'
                : 'text-gray-400'
                }`}
              disabled={!inputValue.trim() || !selectedConversationId || conversationLoading || isStreaming}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
