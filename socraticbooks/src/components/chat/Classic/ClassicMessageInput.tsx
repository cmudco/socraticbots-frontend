// src/components/chat/ClassicMessageInput.tsx
import React from 'react';

interface MessageInputProps {
    onSendMessage?: (message: string) => void;
    onSave?: () => void;
    onGenerateStudyGuide?: () => void;
}

const ClassicMessageInput: React.FC<MessageInputProps> = ({
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

    const handlePromptButton = (promptType: string) => {
        const prompts = {
            'Learning Goals': 'What are the learning goals?',
            'Guiding Questions': 'Can you give me some guiding questions?',
            'Examples': 'Can you give me some examples on this topic?',
            'Mastery Assessment': 'Can you give me the mastery assessment questions for this learning goal?'
        };
        setMessage(prompts[promptType as keyof typeof prompts]);
    };

    return (
        <div className="sticky bottom-0 border-t bg-white p-4">
            <div className="flex space-x-2 mb-2">
                <button
                    onClick={() => handlePromptButton('Learning Goals')}
                    className="px-3 py-1 text-sm bg-socratic text-socratic-font-light rounded-md hover:bg-socratic-light transition-colors"
                >
                    Learning Goals
                </button>
                <button
                    onClick={() => handlePromptButton('Guiding Questions')}
                    className="px-3 py-1 text-sm bg-socratic text-socratic-font-light rounded-md hover:bg-socratic-light transition-colors"
                >
                    Guiding Questions
                </button>
                <button
                    onClick={() => handlePromptButton('Examples')}
                    className="px-3 py-1 text-sm bg-socratic text-socratic-font-light rounded-md hover:bg-socratic-light transition-colors"
                >
                    Examples
                </button>
                <button
                    onClick={() => handlePromptButton('Mastery Assessment')}
                    className="px-3 py-1 text-sm bg-socratic text-socratic-font-light rounded-md hover:bg-socratic-light transition-colors"
                >
                    Mastery Assessment
                </button>
                <button
                    onClick={() => console.log('Clear chat - to be implemented')}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-300 transition-colors"
                >
                    Clear Chat
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

export default ClassicMessageInput;
