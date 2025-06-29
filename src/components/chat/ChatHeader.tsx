// src/components/chat/ChatHeader.tsx
import React from 'react';

import { useChatStore } from '@/stores/chatStore';

import { Button } from '@/components/ui/button';

import ChapterSelector from './ChapterSelector';

const ChatHeader: React.FC = () => {
  const { selectedChapterId } = useChatStore();

  return (
    <header className="sticky top-0 z-0 flex w-full items-center justify-between border-b border-slate-200/60 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm">
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
          className="border-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm hover:from-violet-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400"
        >
          Classic
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={true}
          className="cursor-not-allowed border-slate-300 bg-slate-200 text-slate-400 shadow-sm"
        >
          New
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
