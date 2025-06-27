// src/pages/Chat.tsx
import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';
import TrackingSidebar from '../components/chat/TrackingSidebar';
import NotesSidebar from '../components/chat/NotesSidebar';

const Chat: React.FC = () => {
  return (
    <div className="h-full flex bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50 pr-4">
      {/* Learning Progress Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-slate-200/60 bg-white/90 backdrop-blur-sm overflow-y-auto">
        <TrackingSidebar />
      </div>

      {/* Center Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatInterface />
      </div>

      {/* Right Notes Sidebar - now self-managing width */}
      <NotesSidebar />
    </div>
  );
};

export default Chat;
