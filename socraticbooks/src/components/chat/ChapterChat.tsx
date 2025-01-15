// src/components/chat/ChapterChat.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Chapter } from '../../types/chapter';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LearningGoalTracker from './LearningGoalTracker';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DocumentChunk {
  text: string;
  score: number;
  file_name: string;
}

interface ChapterChatProps {
  chapter: Chapter;
  onBack?: () => void;
}

interface LearningGoalProgress {
  goal_id: string;
  text: string;
  understanding: number;  // changed from coverage to understanding
}

interface LearningGoal {
  id: string;
  text: string;
  chapter_id: string;
  display_order: number;
}

const ChapterChat: React.FC<ChapterChatProps> = ({ chapter, onBack }) => {
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [learningGoalsProgress, setLearningGoalsProgress] = useState<LearningGoalProgress[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chapter.greeting) {
      setMessages([{ 
        role: 'assistant', 
        content: chapter.greeting || "Let's start chatting!" 
      }]);
    }
  }, []);

  useEffect(() => {
    const loadLearningGoalsAndProgress = async () => {
      try {
        // First load learning goals
        const goalsResponse = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}/learning-goals?userId=${chapter.user_id}`
        );
        if (!goalsResponse.ok) throw new Error('Failed to fetch learning goals');
        const goals = await goalsResponse.json() as LearningGoal[];
        setLearningGoals(goals);
  
        // Then load progress
        const progressResponse = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}/learning-progress?userId=${chapter.user_id}`
        );
        if (!progressResponse.ok) throw new Error('Failed to fetch learning progress');
        const progress = await progressResponse.json();
  
        // Set learning goals progress using the progress data
        setLearningGoalsProgress(progress);
        
      } catch (error) {
        console.error('Error loading goals and progress:', error);
      }
    };
  
    loadLearningGoalsAndProgress();
  }, [chapter.id, chapter.user_id]);
  

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}/chat-history?userId=${chapter.user_id}`
        );
        if (!response.ok) throw new Error('Failed to fetch chat history');
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else if (chapter.greeting) {
          setMessages([{ 
            role: 'assistant', 
            content: chapter.greeting
          }]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
  
    const loadLearningProgress = async () => {
      try {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}/learning-progress?userId=${chapter.user_id}`
        );
        if (!response.ok) throw new Error('Failed to fetch learning progress');
        const data = await response.json();
        
        if (data.length > 0) {
          setLearningGoalsProgress(data.map((item: any) => ({
            text: item.text,
            understanding: item.understanding
          })));
        }
      } catch (error) {
        console.error('Error loading learning progress:', error);
      }
    };
  
    loadChatHistory();
    loadLearningProgress();
  }, [chapter.id, chapter.user_id]);
  
  // Add function to save chat history
  const saveChatHistory = async (messages: Message[]) => {
    try {
      await fetch(
        `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}/chat-history?userId=${chapter.user_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages })
        }
      );
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };
  
  // Add function to save learning progress
  const saveLearningProgress = async (progress: LearningGoalProgress[]) => {
    try {
      const progressData = learningGoals.map((goal, index) => ({
        goal_id: goal.id,
        understanding: progress[index].understanding
      }));
  
      await fetch(
        `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}/learning-progress?userId=${chapter.user_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ progress: progressData })
        }
      );
    } catch (error) {
      console.error('Error saving learning progress:', error);
    }
  };

  const getRelevantDocuments = async (question: string): Promise<DocumentChunk[]> => {
    try {
      const response = await fetch(
        `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}/search?userId=${chapter.user_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: question
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search documents');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  };

  const constructSystemPrompt = (relevantDocs: DocumentChunk[]): string => {
    let prompt = `You are teaching students a chapter titled "${chapter.title}"${
      chapter.subject ? ` on the subject ${chapter.subject}` : ''
      }${chapter.topic ? ` and topic ${chapter.topic}` : ''}.
      ${chapter.teaching_style ? `You will have a teaching style of: ${chapter.teaching_style}` : ''}
      ${chapter.qa_instructions ? `You are to respond to questions using: ${chapter.qa_instructions}` : ''}
      ${chapter.restrictions ? `You have the following restrictions: ${chapter.restrictions}` : ''}

      Learning Goals and Current Progress:
      ${learningGoalsProgress.map(goal => 
        `- ${goal.text} (Current Coverage: ${goal.understanding}%)`
      ).join('\n')}`;

    

    if (relevantDocs.length > 0) {
      prompt += '\n\nRelevant content from course materials:\n';
      relevantDocs.forEach(doc => {
        prompt += `\nFrom ${doc.file_name} (relevance: ${doc.score.toFixed(2)}):\n${doc.text}\n`;
      });
      prompt += '\nPlease use the above content to inform your responses when relevant. Cite the source files when you use them.';
    }

    return prompt;
  };

  const evaluateProgress = async (conversation: Message[]) => {
    try {
      const response = await fetch('https://dare.hss.cmu.edu/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: `You are a rigorous learning progress evaluator. Your job is to assess DEEP UNDERSTANDING, not just mention of topics.

              For each learning goal, consider:
              1. Has the student demonstrated clear understanding through their own explanations?
              2. Has the student corrected initial misconceptions?
              3. Can the student apply the knowledge accurately?
              4. Has the concept been thoroughly discussed and verified?

              Learning Goals:
              ${learningGoalsProgress.map((goal, i) => `${i + 1}. ${goal.text}`).join('\n')}
              
              Return ONLY a JSON array of numbers (0-100) representing TRUE UNDERSTANDING of each goal.
              - 0%: Not discussed or only mentioned
              - 15%: Topic introduced but with clear misconceptions
              - 25%: Student is beginning to question misconceptions
              - 50%: Student has corrected misconceptions but hasn't demonstrated full understanding
              - 75%: Student shows good understanding with clear explanation
              - 100%: Complete mastery with ability to explain to others
              
              Be conservative in scoring. Misconceptions should significantly lower the score.
              Do not include any other text in your response.`
            },
            { 
              role: 'user', 
              content: `Evaluate this conversation:\n${conversation.map(m => 
                `${m.role}: ${m.content}`).join('\n')}`
            }
          ]
        }),
      });

      console.log('Learning goals being evaluated:', learningGoalsProgress);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      let fullResponse = '';

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

            fullResponse += data.content;
          }
        }
      }

      console.log('Raw response:', fullResponse);

      try {
        const cleanResponse = fullResponse.replace(/```json\n?|\n?```/g, '').trim();
        console.log('Cleaned response:', cleanResponse);
        
        const coverageValues = JSON.parse(cleanResponse);
        if (Array.isArray(coverageValues)) {
          // Update progress and save to backend
          const updatedProgress = learningGoals.map((goal, index) => ({
            goal_id: goal.id,
            understanding: coverageValues[index] || 0
          }));

          // Save to backend
          const saveResponse = await fetch(
            `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}/learning-progress?userId=${chapter.user_id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ progress: updatedProgress })
            }
          );

          if (!saveResponse.ok) {
            throw new Error('Failed to save progress');
          }

          // Update local state with new progress and goal text
          setLearningGoalsProgress(
            learningGoals.map((goal, index) => ({
              goal_id: goal.id,
              text: goal.text,
              understanding: coverageValues[index] || 0
            }))
          );
        }
      } catch (error) {
        console.error('Error parsing/saving progress evaluation:', error);
        console.error('Failed to parse response:', fullResponse);
      }

    } catch (error) {
      console.error('Error evaluating progress:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      // First, get relevant documents for the query
      const relevantDocs = await getRelevantDocuments(content);
      const systemPrompt = constructSystemPrompt(relevantDocs);
      console.log('System prompt:', systemPrompt);

      const response = await fetch('https://dare.hss.cmu.edu/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
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

      // After message exchange is complete, evaluate progress
      await evaluateProgress([...messages, newMessage, assistantMessage]);
      await saveChatHistory([...messages, newMessage, assistantMessage]);

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

  const handleGoalClick = (index: number) => {
    console.log(`Clicked goal ${index + 1}: ${learningGoalsProgress[index].text}`);
    // Could add functionality here like focusing on specific goals
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

      {/* Learning Goal Tracker */}
      <div className="px-4 py-2 border-b">
        <LearningGoalTracker 
          goals={learningGoalsProgress}
          onGoalClick={handleGoalClick}
        />
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