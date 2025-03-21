// src/components/chat/ChatInterface.tsx
import React, { useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';

const ChatInterface: React.FC = () => {
  const { selectedChapterId } = useAppSelector(state => state.chat);
  
  // This effect will run whenever selectedChapterId changes
  useEffect(() => {
    if (selectedChapterId) {
      console.log('Chapter Selected:', selectedChapterId);
      // In the future, we can load conversation history here
      // For example: dispatch(fetchConversationHistory(selectedChapterId));
    }
  }, [selectedChapterId]);
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {!selectedChapterId ? (
          // Show this message when no chapter is selected
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
        ) : (
          // This is intentionally left empty for now
          // In the future, this is where we'll show the conversation
          <div></div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 py-3 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center border rounded-md">
            <input 
              type="text" 
              placeholder={selectedChapterId ? "Type your message..." : "Please select a chapter first"}
              className="flex-grow px-4 py-2 focus:outline-none"
              disabled={!selectedChapterId}
            />
            <button 
              className="px-4 py-2 text-gray-400"
              disabled={!selectedChapterId}
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
