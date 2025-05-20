// src/components/chat/ChatHeader.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedChapter } from '../../store/slices/chatSlice';

const ChatHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availableChapters, selectedChapterId, loading, error } = useAppSelector(state => state.chat);
  const apiIsReady = useAppSelector(state => state.api?.isReady);

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterId = e.target.value;
    dispatch(setSelectedChapter(chapterId || null));
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
        {!apiIsReady ? (
          <div className="text-sm text-gray-500">Connecting to API...</div>
        ) : loading ? (
          <div className="text-sm text-gray-500">Loading bots...</div>
        ) : error ? (
          <div className="text-sm text-red-500">Error: {error}</div>
        ) : availableChapters.length === 0 ? (
          <div className="text-sm text-gray-500">No bots available</div>
        ) : (
          <select
            className="w-64 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedChapterId || ''}
            onChange={handleChapterChange}
          >
            <option value="" disabled>Select a bot</option>
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
