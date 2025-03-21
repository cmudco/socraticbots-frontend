// src/components/chat/ChatInterface.tsx
import React from 'react';
import { useAppSelector } from '../../store/hooks';

const ChatInterface: React.FC = () => {
  const { selectedChapterId } = useAppSelector(state => state.chat);
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Message Area - Empty */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* This is intentionally left empty */}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 py-3 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center border rounded-md">
            <input 
              type="text" 
              placeholder="Type your message..."
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
