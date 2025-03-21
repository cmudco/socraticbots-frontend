// src/components/chat/ChatInterface.tsx
import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchConversationForChapter } from '../../store/thunks/chatThunks';

const ChatInterface: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    selectedChapterId,
    conversation,
    conversationLoading,
    conversationError
  } = useAppSelector(state => state.chat);
  
  // Fetch conversation when chapter is selected
  useEffect(() => {
    if (selectedChapterId) {
      console.log('Chapter Selected:', selectedChapterId);
      dispatch(fetchConversationForChapter(selectedChapterId));
    }
  }, [selectedChapterId, dispatch]);
  
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
      if (conversation.messages && conversation.messages.length > 0) {
        // Show existing conversation history
        return (
          <div className="space-y-4 py-4">
            {conversation.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3/4 rounded-lg px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        );
      } else {
        // Empty conversation - we would need to get the greeting separately
        // For now, just show a blank slate message
        return (
          <div className="flex justify-center items-center h-64 text-gray-400">
            <p>Start a new conversation</p>
          </div>
        );
      }
    }
    
    // Fallback
    return null;
  };
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {renderContent()}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 py-3 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center border rounded-md">
            <input 
              type="text" 
              placeholder={selectedChapterId ? "Type your message..." : "Please select a chapter first"}
              className="flex-grow px-4 py-2 focus:outline-none"
              disabled={!selectedChapterId || conversationLoading}
            />
            <button 
              className="px-4 py-2 text-gray-400"
              disabled={!selectedChapterId || conversationLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
