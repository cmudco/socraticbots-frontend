import React, { useState, useRef, useEffect } from 'react';
import { Chapter } from '../../types/chapter';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChapterChatProps {
  chapter: Chapter;
  onBack?: () => void;
}

const ChapterChat: React.FC<ChapterChatProps> = ({ chapter, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const constructSystemPrompt = (chapter: Chapter): string => {
    return `You are a teaching assistant for this chapter.
    ${chapter.teaching_style ? `Teaching Style: ${chapter.teaching_style}` : ''}
    ${chapter.qa_instructions ? `Instructions: ${chapter.qa_instructions}` : ''}
    ${chapter.restrictions ? `Restrictions: ${chapter.restrictions}` : ''}
    ${chapter.learning_goals ? `Learning Goals: ${chapter.learning_goals.join('\n')}` : ''}`;
  };

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('https://dare.hss.cmu.edu/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: constructSystemPrompt(chapter) },
            ...messages,
            newMessage
          ]
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      let assistantMessage: Message = { role: 'assistant', content: '' };
      
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              console.error('Error:', data.error);
              break;
            }

            if (data.content === '[DONE]') {
              break;
            }

            assistantMessage.content += data.content;
            setMessages(prev => [
              ...prev.slice(0, -1),
              { ...assistantMessage }
            ]);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Sorry, there was an error processing your message. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{chapter.title}</h2>
          {chapter.subject && (
            <p className="text-sm text-gray-600">Subject: {chapter.subject}</p>
          )}
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 
                     bg-white rounded-md border border-gray-300 hover:bg-gray-50 
                     transition-colors duration-200"
          >
            Back to Chapters
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            content={message.content}
            isUser={message.role === 'user'}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChapterChat;