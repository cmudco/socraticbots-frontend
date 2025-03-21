// src/pages/Chat.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAvailableChapters } from '../store/thunks/chatThunks';
import { setSelectedChapter } from '../store/slices/chatSlice';

const Chat: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Get chat state from Redux
  const { 
    availableChapters, 
    selectedChapterId,
    loading, 
    error 
  } = useAppSelector(state => state.chat);

  // Fetch chapters when component mounts
  useEffect(() => {
    dispatch(fetchAvailableChapters());
  }, [dispatch]);

  // Handle chapter selection from dropdown
  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterId = e.target.value;
    dispatch(setSelectedChapter(chapterId || null));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chat</h1>
        
        {/* Dropdown for chapter selection */}
        <div className="w-64">
          <label htmlFor="chapter-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select a chapter
          </label>
          
          {loading ? (
            <div className="text-sm text-gray-500">Loading chapters...</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error: {error}</div>
          ) : (
            <select
              id="chapter-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
      
      {/* Display placeholder for selected chapter */}
      {selectedChapterId ? (
        <div className="bg-gray-100 p-4 rounded-md">
          <p>
            Selected Chapter: {availableChapters.find(ch => ch.id === selectedChapterId)?.title}
          </p>
          <p className="text-gray-600 mt-2">
            Chat interface will be added here in the next step.
          </p>
        </div>
      ) : (
        <p className="text-gray-600">
          Please select a chapter to start chatting.
        </p>
      )}
    </div>
  );
};

export default Chat;
