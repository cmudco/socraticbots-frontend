// src/pages/Chat.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAvailableChapters } from '../store/thunks/chatThunks';
import ChatHeader from '../components/chat/ChatHeader';
import TrackingSidebar from '../components/chat/TrackingSidebar';
import ChatInterface from '../components/chat/ChatInterface';
import NotesSidebar from '../components/chat/NotesSidebar';

const Chat: React.FC = () => {
  const dispatch = useAppDispatch();
  const apiIsReady = useAppSelector(state => state.api?.isReady);
  
  useEffect(() => {
    if (apiIsReady) {
      dispatch(fetchAvailableChapters());
    }
  }, [dispatch, apiIsReady]);

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
