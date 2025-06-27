// src/pages/Chat.tsx
import React from 'react';
import ChatHeader from '../components/chat/ChatHeader';
import TrackingSidebar from '../components/chat/TrackingSidebar';
import ChatInterface from '../components/chat/ChatInterface';
import NotesSidebar from '../components/chat/NotesSidebar';

const Chat: React.FC = () => {
  // Apply negative margins to counteract the Layout padding
  return (
    <div className="flex flex-col -m-6 h-[calc(100vh-3.5rem)] overflow-hidden">
      <ChatHeader />
      <div className="flex flex-1 overflow-hidden">
        <TrackingSidebar />
        <ChatInterface />
        <NotesSidebar />
      </div>
    </div>
  );
};

export default Chat;
