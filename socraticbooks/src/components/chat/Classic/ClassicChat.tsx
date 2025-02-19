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
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSendMessage = async (messageText: string) => {
        // Create and add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: messageText,
            type: 'user',
            timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, userMessage]);

        // Simulate AI thinking
        setIsLoading(true);

        // TODO: Replace this with actual API call
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `<p>I received your message: "${messageText}". This is a temporary response.</p>`,
                type: 'ai',
                timestamp: new Date()
            };
            
            setMessages(prevMessages => [...prevMessages, aiMessage]);
            setIsLoading(false);
        }, 1000);
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
        <div className="flex-1 flex flex-col h-full min-w-0">
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {messages.map((message) => (
                        <ClassicMessageBubble key={message.id} message={message} />
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mb-4 w-full">
                            <div className="flex items-center space-x-2 max-w-[80%]">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-socratic flex items-center justify-center">
                                    <div className="w-5 h-5 bg-white/30 rounded-full animate-pulse" />
                                </div>
                                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                                    <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    )}
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
