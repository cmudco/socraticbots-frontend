// src/components/chat/TrackingSidebar.tsx
import React from 'react';
import { useAppSelector } from '../../store/hooks';
import ReactMarkdown from 'react-markdown';

const TrackingSidebar: React.FC = () => {
  const { 
    trackingProgress, 
    trackingError, 
    trackingResult,
    selectedChapterId
  } = useAppSelector(state => state.chat);

  // Render different states
  const renderContent = () => {
    // If no chapter selected
    if (!selectedChapterId) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg 
            className="w-12 h-12 mb-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
          <p className="text-sm">Select a bot to begin</p>
        </div>
      );
    }

    // If tracking is in progress
    if (trackingProgress) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-sm text-gray-600">Analyzing progress...</p>
        </div>
      );
    }

    // If there's an error
    if (trackingError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <svg 
            className="w-12 h-12 mb-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p className="text-sm text-center px-4">{trackingError}</p>
        </div>
      );
    }

    // If we have tracking results
    if (trackingResult) {
      return (
        <div className="prose prose-sm max-w-none space-y-8">
          <ReactMarkdown 
            components={{
              h1: ({children}) => <h1 className="text-xl font-bold mt-1 mb-1 border-b pb-2">{children}</h1>,
              h2: ({children}) => <h2 className="text-lg font-semibold mt-1 mb-1 border-b pb-2">{children}</h2>,
              ul: ({children}) => <ul className="mt-1 mb-1 space-y-2 list-disc pl-5">{children}</ul>,
              ol: ({children}) => <ol className="mt-1 mb-1 space-y-2 list-decimal pl-5">{children}</ol>,
              h3: ({children}) => <h3 className="text-lg font-semibold mt-1 mb-1 border-b pb-2">{children}</h3>,
            }}
          >
            {trackingResult}
          </ReactMarkdown>
        </div>
      );
    }

    // Default state (no tracking done yet)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg 
          className="w-12 h-12 mb-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
        <p className="text-sm">Start a conversation to begin analysis.</p>
      </div>
    );
  };

  return (
    <div className="w-72 h-full overflow-y-auto border-r border-gray-200 bg-white">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Analysis (Helper Bot)</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default TrackingSidebar;
