// src/pages/Chat.tsx
import React from 'react';

import ChatInterface from '../components/chat/ChatInterface';
import NotesSidebar from '../components/chat/NotesSidebar';
import TrackingSidebar from '../components/chat/TrackingSidebar';

const Chat: React.FC = () => {
  return (
    <div className="flex h-full bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50 pr-4">
      {/* Learning Progress Sidebar */}
      <div className="max-w-[320px] min-w-[320px] flex-shrink-0 overflow-y-auto border-r border-slate-200/60 bg-white/90 backdrop-blur-sm">
        <TrackingSidebar />
      </div>

      {/* Center Chat Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatInterface />
      </div>

      {/* Right Notes Sidebar - now self-managing width */}
      <NotesSidebar />
    </div>
  );
};

export default Chat;
