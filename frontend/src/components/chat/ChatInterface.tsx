// src/components/chat/ChatInterface.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchConversationForChapter, sendStreamingMessage } from '../../store/thunks/chatThunks';
import MessageList from './MessageList';


const ChatInterface: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    selectedChapterId,
    conversation,
    conversationLoading,
    conversationError,
    messageSending,
    messageError,
    isStreaming,
    streamingError,
    pendingAssistantMessage
  } = useAppSelector(state => state.chat);
  
  const [message, setMessage] = useState('');
  const messageInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch conversation when chapter is selected
  useEffect(() => {
    if (selectedChapterId) {
      console.log('Chapter Selected:', selectedChapterId);
      dispatch(fetchConversationForChapter(selectedChapterId));
      // Focus the input field when a chapter is selected
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  }, [selectedChapterId, dispatch]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim() || !selectedChapterId || !conversation) return;
    
    // Log the message being sent and conversation details
    console.log('------ SENDING MESSAGE ------');
    console.log('Message:', message);
    console.log('Conversation ID:', conversation.id);
    console.log('Chapter ID:', selectedChapterId);
    console.log('----------------------------');
    
    // Store the message text before clearing the input
    const messageToSend = message.trim();
    
    // Clear input immediately for better UX
    setMessage('');
    
    // Use the thunk instead of calling the service directly
    dispatch(sendStreamingMessage({
      conversationId: conversation.id,
      message: messageToSend
    }));
  };
  
  // Handle keypress for sending message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only send on Ctrl+Enter
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Prevent form submission on regular Enter
    else if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  
  // Render the appropriate content based on state
  const renderContent = () => {
    if (!selectedChapterId) {
      // No chapter selected
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 mt-8">
          <svg 
            className="w-16 h-16 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          <p className="text-xl font-medium mb-2">Please Select a Chapter</p>
          <p className="text-center max-w-md">
            Use the dropdown box along the top of the screen to select a chapter.
            Once you select a chapter, you can begin chatting.
          </p>
        </div>
      );
    }
    
    if (conversationLoading) {
      // Loading conversation
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      );
    }
    
    if (conversationError) {
      // Error loading conversation
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{conversationError}</p>
        </div>
      );
    }
    
    if (conversation) {
      return (
        <MessageList 
          messages={conversation.messages || []} 
          greeting={conversation.chapter_details?.greeting}
        />
      );
    }
    
    // Fallback
    return null;
  };
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {renderContent()}
        {/* Show message error if there is one */}
        {messageError && (
          <div className="p-3 bg-red-100 text-red-800 rounded-md mt-2 mx-auto max-w-md">
            <p>Error sending message: {messageError}</p>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 py-3 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); }} className="flex items-center border rounded-md">
            <input 
              ref={messageInputRef}
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                messageSending 
                  ? "Sending message..." 
                  : (selectedChapterId 
                      ? "Type your message... (Ctrl+Enter to send)" 
                      : "Please select a chapter first")
              }
              className="flex-grow px-4 py-2 focus:outline-none"
              disabled={!selectedChapterId || conversationLoading || messageSending}
            />
            <button 
              type="button"
              onClick={handleSendMessage}
              className={`px-4 py-2 ${
                message.trim() && selectedChapterId && !messageSending 
                  ? 'text-purple-600' 
                  : 'text-gray-400'
              }`}
              disabled={!message.trim() || !selectedChapterId || conversationLoading || messageSending}
            >
              {messageSending ? (
                // Show a spinner when sending
                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                // Show regular send icon otherwise
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
