// src/components/chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { sendStreamingMessage } from '../../store/thunks/chatThunks';
import { clearMessages } from '../../store/slices/chatSlice';

const ChatInterface: React.FC = () => {
  const dispatch = useAppDispatch();
  const { messages, isStreaming, error } = useAppSelector(state => state.chat);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;
    
    // Dispatch the streaming message action
    await dispatch(sendStreamingMessage({ message: inputMessage }));
    
    // Clear input
    setInputMessage('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    dispatch(clearMessages());
  };
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Scrollable Message Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {messages.length === 0 ? (
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
            <p className="text-xl font-medium mb-2">Start a conversation</p>
            <p className="text-center max-w-md">
              Type a message below to test streaming functionality
            </p>
          </div>
        ) : (
          // Render all messages
          messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`max-w-3xl mx-auto my-4 ${
                message.role === 'user' ? 'ml-auto' : ''
              }`}
            >
              <div className={`p-4 rounded-lg ${
                message.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                <p className={message.role === 'user' ? 'text-blue-900' : 'text-purple-900'}>
                  {message.content || (isStreaming && index === messages.length - 1 ? '...' : '')}
                </p>
              </div>
            </div>
          ))
        )}

        {error && (
          <div className="max-w-3xl mx-auto my-4 p-4 bg-red-100 text-red-800 rounded-lg">
            Error: {error}
          </div>
        )}
        
        {/* Invisible div for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Fixed Chat Controls - Will always be at the bottom */}
      <div className="border-t border-gray-200 py-3 px-4 bg-white">
        {messages.length > 0 && (
          <div className="max-w-3xl mx-auto flex justify-center mb-3">
            <button 
              className="px-3 py-2 bg-red-600 text-white rounded-md text-sm"
              onClick={handleClearChat}
            >
              Clear Chat
            </button>
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center border rounded-md">
            <input 
              type="text" 
              placeholder="Type your message to test streaming..."
              className="flex-grow px-4 py-2 focus:outline-none"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isStreaming}
            />
            <button 
              className={`px-4 py-2 ${inputMessage.trim() && !isStreaming ? 'text-blue-500' : 'text-gray-400'}`}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isStreaming}
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
