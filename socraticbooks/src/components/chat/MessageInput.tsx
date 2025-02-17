// src/components/chat/MessageInput.tsx
import React from 'react';

interface MessageInputProps {
    onSendMessage?: (message: string) => void;
    onSave?: () => void;
    onGenerateStudyGuide?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    onSave,
    onGenerateStudyGuide
}) => {
    const [message, setMessage] = React.useState('');

    const handleSend = () => {
        if (message.trim() && onSendMessage) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="sticky bottom-0 border-t bg-white p-4">
            <div className="flex space-x-2 mb-2">
                <button 
                    onClick={onSave}
                    className="px-3 py-1 text-sm bg-gray-100 text-socratic-font-dark rounded-full hover:bg-gray-200 transition-colors"
                    title="Save for later"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                </button>
                <button 
                    onClick={onGenerateStudyGuide}
                    className="px-3 py-1 text-sm bg-gray-100 text-socratic-font-dark rounded-full hover:bg-gray-200 transition-colors"
                    title="Generate Study Guide"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                </button>
            </div>
            <div className="flex items-center space-x-2">
                <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-socratic focus:border-transparent"
                />
                <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors
                        ${message.trim() 
                            ? 'bg-socratic text-white hover:bg-socratic-dark' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
