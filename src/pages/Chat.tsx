// src/pages/Chat.tsx
import React from 'react';

import ChatInterface from '../components/chat/ChatInterface';
import NotesSidebar from '../components/chat/NotesSidebar';
import TrackingSidebar from '../components/chat/TrackingSidebar';

const Chat: React.FC = () => {
  return (
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50">
      {/* Learning Progress Sidebar - responsive width */}
      <div className="w-80 min-w-0 flex-shrink-0 overflow-y-auto border-r border-slate-200/60 bg-white/90 backdrop-blur-sm">
        <TrackingSidebar />
      </div>

      {/* Center Chat Area - flexible with minimum width */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatInterface />
      </div>

      {/* Right Notes Sidebar - self-managing width with proper constraints */}
      <div className="min-w-0 flex-shrink-0">
        <NotesSidebar />
      </div>
    </div>
  );
};

export default Chat;
