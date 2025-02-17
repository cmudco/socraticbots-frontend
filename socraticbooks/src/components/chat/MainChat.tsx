import React from 'react';
import { Chapter } from '../../services/chatService';

interface MainChatProps {
    chapter: Chapter;
}

const MainChat: React.FC<MainChatProps> = ({ chapter }) => {
    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {Array(20).fill(0).map((_, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded">
                            Test Message {i + 1}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Input area - absolutely positioned at bottom */}
            <div className="sticky bottom-0 border-t bg-white p-4">
                <input 
                    type="text" 
                    placeholder="Type your message..."
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-socratic focus:border-transparent"
                />
            </div>
        </div>
    );
};

export default MainChat;