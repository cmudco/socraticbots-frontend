// src/components/chat/ChatHeader.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedChapter } from '../../store/slices/chatSlice';

const ChatHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availableChapters, selectedChapterId, loading, error } = useAppSelector(state => state.chat);

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterId = e.target.value;
    dispatch(setSelectedChapter(chapterId || null));
  };

  return (
    <div className="flex items-center p-2 border-b border-gray-200">
      {/* Mode Toggle */}
      <div className="flex space-x-2 mr-4 border-r pr-4 border-gray-300">
        <button 
          className="px-3 py-1 bg-purple-600 text-white rounded-md font-medium text-sm"
          disabled
        >
          Classic
        </button>
        <button 
          className="px-3 py-1 text-gray-400 rounded-md font-medium text-sm"
          disabled
        >
          New
        </button>
      </div>

      {/* Chapter Dropdown */}
      <div className="flex-grow">
        {loading ? (
          <div className="text-sm text-gray-500">Loading chapters...</div>
        ) : error ? (
          <div className="text-sm text-red-500">Error: {error}</div>
        ) : (
          <select
            className="w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
