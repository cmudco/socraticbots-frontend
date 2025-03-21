// src/components/chat/ChatInterface.tsx
import React from 'react';

const ChatInterface: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Scrollable Message Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Example AI Message */}
        <div className="max-w-3xl mx-auto my-4 bg-purple-100 p-4 rounded-lg">
          <p className="text-purple-900">
            MQ1 the thiking patterns you want someone to use
          </p>
        </div>
        
        {/* Example User Response */}
        <div className="max-w-3xl mx-auto my-4">
          <p className="text-gray-800">
            Good attempt! However, let's refine your answer.
          </p>
        </div>
        
        {/* Example AI Follow-up */}
        <div className="max-w-3xl mx-auto my-4">
          <p className="font-medium">MQ1) What is the main idea behind Tree of Thought (ToT) prompting?</p>
          <p className="mt-2">
            ToT helps AI think in structured steps, rather than providing an instant response. Just like a detective solving a case, ToT breaks down complex problems, considers multiple possibilities, and self-corrects to find the best solution.
          </p>
          <p className="mt-2">
            Would you like to try another answer, or would you like a hint?
          </p>
        </div>
      </div>
      
      {/* Fixed Chat Controls - Will always be at the bottom */}
      <div className="border-t border-gray-200 py-3 px-4 bg-white">
        <div className="max-w-3xl mx-auto flex space-x-2 mb-3 justify-center">
          <button className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm">Learning Goals</button>
          <button className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm">Guiding Questions</button>
          <button className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm">Examples</button>
          <button className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm">Mastery Assessment</button>
          <button className="px-3 py-2 bg-red-600 text-white rounded-md text-sm">Clear Chat</button>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center border rounded-md">
            <input 
              type="text" 
              placeholder="Type your message..."
              className="flex-grow px-4 py-2 focus:outline-none"
            />
            <button className="px-4 py-2 text-gray-500">
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
