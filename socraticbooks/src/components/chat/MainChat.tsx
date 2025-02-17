import React from 'react';
import { Chapter } from '../../services/chatService';
import MessageInput from './MessageInput';

interface MainChatProps {
    chapter: Chapter;
}

const MainChat: React.FC<MainChatProps> = ({ chapter }) => {
    const handleSendMessage = (message: string) => {
        // Will implement later
        console.log('Sending message:', message);
    };

    const handleSave = () => {
        // Will implement later
        console.log('Saving...');
    };

    const handleGenerateStudyGuide = () => {
        // Will implement later
        console.log('Generating study guide...');
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {/* Messages will be populated here */}
                </div>
            </div>
            
            <MessageInput 
                onSendMessage={handleSendMessage}
                onSave={handleSave}
                onGenerateStudyGuide={handleGenerateStudyGuide}
            />
        </div>
    );
};

export default MainChat;