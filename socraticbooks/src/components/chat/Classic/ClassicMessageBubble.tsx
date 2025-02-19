// src/components/chat/Classic/ClassicMessageBubble.tsx
import React from 'react';
import { Message } from '../../../types/chat';
import DOMPurify from 'dompurify';

interface ClassicMessageBubbleProps {
    message: Message;
}

const ClassicMessageBubble: React.FC<ClassicMessageBubbleProps> = ({ message }) => {
    const isSystem = message.type === 'system' || message.type === 'ai';

    const sanitizedContent = DOMPurify.sanitize(message.content, {
        ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br'],
        ALLOWED_ATTR: ['href', 'target']
    });

    return (
        <div className={`flex ${isSystem ? 'justify-start' : 'justify-end'} mb-4 w-full`}>
            {isSystem && (
                <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-socratic flex items-center justify-center">
                        <svg 
                            className="w-5 h-5 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                            />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className={`
                            rounded-2xl 
                            px-4 
                            py-2 
                            bg-gray-100 
                            rounded-tl-none 
                            break-words
                            shadow-sm
                            border border-gray-200
                            relative
                            before:content-['']
                            before:absolute
                            before:left-[-8px]
                            before:top-[12px]
                            before:w-4
                            before:h-4
                            before:bg-gray-100
                            before:border-l
                            before:border-t
                            before:border-gray-200
                            before:transform
                            before:rotate-45
                            before:-z-10
                        `}>
                            <div dangerouslySetInnerHTML={{ __html: message.content }} />
                        </div>
                    </div>
                </div>
            )}
            
            {!isSystem && (
                <div className="max-w-[80%]">
                    <div className={`
                        rounded-2xl 
                        px-4 
                        py-2 
                        bg-socratic 
                        text-white 
                        rounded-tr-none 
                        break-words
                        shadow-sm
                        relative
                        before:content-['']
                        before:absolute
                        before:right-[-8px]
                        before:top-[12px]
                        before:w-4
                        before:h-4
                        before:bg-socratic
                        before:transform
                        before:rotate-45
                        before:-z-10
                    `}>
                        <div dangerouslySetInnerHTML={{ __html: message.content }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassicMessageBubble;
