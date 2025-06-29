// src/components/chat/ChatHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import ChapterSelector from './ChapterSelector';
import { useChatStore } from '@/stores/chatStore';

const ChatHeader: React.FC = () => {
  const { selectedChapterId } = useChatStore();

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-white/90 backdrop-blur-sm sticky top-0 z-0 shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Chapter Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-600">Chapter:</span>
          <ChapterSelector />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Classic/New Buttons */}
        <Button
          variant="outline"
          size="sm"
          disabled={!selectedChapterId}
          className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 hover:from-violet-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 shadow-sm"
        >
          Classic
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={true}
          className="bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-sm"
        >
          New
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
