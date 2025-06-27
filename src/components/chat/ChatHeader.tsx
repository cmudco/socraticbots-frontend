// src/components/chat/ChatHeader.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { useChatStore } from '@/stores/chatStore';

const ChatHeader: React.FC = () => {
  const { selectedChapterId, setSelectedChapterId } = useChatStore();
  const { data: availableChapters = [], isLoading, error } = useQuery({
    queryKey: ['chat', 'availableChapters'],
    queryFn: chatService.getAvailableChapters,
    staleTime: 5 * 60 * 1000,
  });

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterId = e.target.value;
    setSelectedChapterId(chapterId || null);
  };

  return (
    <div className="flex items-center p-3 border-b border-gray-200 bg-white">
      {/* Mode Toggle */}
      <div className="flex space-x-2 mr-4">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded-md font-medium text-sm"
          disabled
        >
          Classic
        </button>
        <button
          className="px-3 py-1 text-gray-400 bg-gray-100 rounded-md font-medium text-sm"
          disabled
        >
          New
        </button>
      </div>

      {/* Chapter Dropdown */}
      <div className="flex-grow">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading chapters...</div>
        ) : error ? (
          <div className="text-sm text-red-500">Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
        ) : availableChapters.length === 0 ? (
          <div className="text-sm text-gray-500">No chapters available</div>
        ) : (
          <select
            className="w-64 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedChapterId || ''}
            onChange={handleChapterChange}
          >
            <option value="" disabled>Select a chapter</option>
            {availableChapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
