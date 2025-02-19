// src/components/chat/Classic/ClassicChat.tsx
import React, { useState, useEffect } from 'react';
import { Chapter } from '../../../services/chatService';
import MessageInput from './ClassicMessageInput';
import ClassicMessageBubble from './ClassicMessageBubble';
import { Message } from '../../../types/chat';

interface ClassicChatProps {
    chapter: Chapter;
}

const ClassicChat: React.FC<ClassicChatProps> = ({ chapter }) => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (chapter.greeting) {
            const greetingMessage: Message = {
                id: 'greeting',
                content: chapter.greeting,
                type: 'system',
                timestamp: new Date()
            };
            setMessages([greetingMessage]);
            console.log("Messages set to:", [greetingMessage]);
        }
    }, [chapter]);

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
        <div className="flex-1 flex flex-col h-full min-w-0"> {/* Added min-w-0 */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {messages.map((message) => (
                        <ClassicMessageBubble key={message.id} message={message} />
                    ))}
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

export default ClassicChat;
