// src/components/chat/Classic/ClassicChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Chapter, getChatHistory, API_BASE_URL } from '../../../services/chatService';
import MessageInput from './ClassicMessageInput';
import ClassicMessageBubble from './ClassicMessageBubble';
import { Message } from '../../../types/chat';
import { useAuth } from '../../../services/auth';

interface ClassicChatProps {
    chapter: Chapter;
    onTrackingUpdate?: (tracking: string, isLoading: boolean) => void;
}

const ClassicChat: React.FC<ClassicChatProps> = ({ chapter, onTrackingUpdate }) => {
    const user = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentAiMessage = useRef<string>('');

    // Load chat history when component mounts
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                if (!user?.uid) return;
    
                const history = await getChatHistory(chapter.id, user.uid);
                console.log('Loaded history:', history);
                
                if (history.messages && history.messages.messages && history.messages.messages.length > 0) {
                    const formattedMessages = history.messages.messages.map((msg, index): Message => {
                        let content = msg.content;
                        
                        // Format AI/system messages with proper HTML structure
                        if (msg.role === 'assistant') {
                            // Split into lines and wrap each in <p> tags if not already wrapped
                            content = content.split('\n')
                                .map(line => line.trim())
                                .filter(line => line.length > 0)
                                .map(line => {
                                    if (line.startsWith('<') && line.endsWith('>')) {
                                        return line; // Already has HTML
                                    }
                                    // Handle bullet points
                                    if (line.startsWith('- ')) {
                                        return `<p>${line}</p>`;
                                    }
                                    // Handle numbered points
                                    if (/^\d+\./.test(line)) {
                                        return `<p>${line}</p>`;
                                    }
                                    return `<p>${line}</p>`;
                                })
                                .join('');
                        }
    
                        return {
                            id: `history-${msg.timestamp}-${index}`,
                            content: content,
                            type: msg.role === 'user' ? 'user' : 'ai',
                            timestamp: new Date(msg.timestamp)
                        };
                    });
                    setMessages(formattedMessages);
                } else if (chapter.greeting) {
                    const greetingContent = chapter.greeting.startsWith('<') 
                        ? chapter.greeting 
                        : `<p>${chapter.greeting}</p>`;
                    
                    const greetingMessage: Message = {
                        id: `greeting-${Date.now()}`,
                        content: greetingContent,
                        type: 'system',
                        timestamp: new Date()
                    };
                    setMessages([greetingMessage]);
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        };
    
        loadChatHistory();
    }, [chapter.id, user?.uid]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (messageText: string) => {
        if (!user?.uid) {
            console.error('No user ID available');
            return;
        }
    
        const messageId = Date.now().toString();
        const userMessage: Message = {
            id: `user-${messageId}`,
            content: messageText,
            type: 'user',
            timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setIsLoading(true);
        if (onTrackingUpdate) {
            onTrackingUpdate('', true); // Start tracking loading
        }
        currentAiMessage.current = '';
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/socratic-books/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    chapter_id: chapter.id,
                    uid: user.uid
                })
            });
    
            if (!response.body) throw new Error('No response body');
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let trackingContent = '';
    
            const aiMessage: Message = {
                id: `ai-${messageId}`,
                content: '',
                type: 'ai',
                timestamp: new Date()
            };
    
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
    
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
    
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
    
                            if (data.type === 'chat') {
                                currentAiMessage.current += data.content;
                                // Format the message content with proper HTML
                                const formattedContent = currentAiMessage.current.split('\n')
                                    .map(line => line.trim())
                                    .filter(line => line.length > 0)
                                    .map(line => {
                                        if (line.startsWith('<') && line.endsWith('>')) {
                                            return line;
                                        }
                                        // Handle bullet points
                                        if (line.startsWith('- ')) {
                                            return `<p>${line}</p>`;
                                        }
                                        // Handle numbered points
                                        if (/^\d+\./.test(line)) {
                                            return `<p>${line}</p>`;
                                        }
                                        return `<p>${line}</p>`;
                                    })
                                    .join('');
    
                                aiMessage.content = formattedContent;
                                
                                setMessages(prev => {
                                    const exists = prev.some(m => m.id === aiMessage.id);
                                    if (exists) {
                                        return prev.map(m => 
                                            m.id === aiMessage.id ? aiMessage : m
                                        );
                                    }
                                    return [...prev, aiMessage];
                                });
                            }
                            else if (data.type === 'tracker') {
                                trackingContent += data.content;
                                if (onTrackingUpdate) {
                                    // Just pass the raw markdown content
                                    onTrackingUpdate(trackingContent, true);
                                }
                            }
                            else if (data.type === 'complete') {
                                setIsLoading(false);
                                if (onTrackingUpdate) {
                                    onTrackingUpdate(trackingContent, false);
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing stream data:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setIsLoading(false);
            if (onTrackingUpdate) {
                onTrackingUpdate('', false);
            }
        }
    };
    

    const handleSave = () => {
        console.log('Saving...');
    };

    const handleGenerateStudyGuide = () => {
        console.log('Generating study guide...');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
                    <div ref={messagesEndRef} />
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
