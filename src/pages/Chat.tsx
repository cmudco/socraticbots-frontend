import React from 'react';

import { useUserInfo } from '@/hooks/queries/useUser';
import { useConversationStore } from '@/stores/core/conversationStore';
import BotChatInterface from '@/components/chat/bot/BotChatInterface';
import ChatHeader from '@/components/chat/ChatHeader';
import NotesSidebar from '@/components/chat/NotesSidebar';
import TrackingSidebar from '@/components/chat/TrackingSidebar';

const Chat: React.FC = () => {
  const { data: user, isLoading } = useUserInfo();
  const { currentBotId } = useConversationStore();

  // Show loading while fetching user data
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-600">Authentication required</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50">
      <div className="w-80 min-w-0 flex-shrink-0 overflow-y-auto border-r border-slate-200/60 bg-white/90 backdrop-blur-sm">
        <TrackingSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Always show the header with bot selector */}
        <ChatHeader />
        
        {currentBotId ? (
          <BotChatInterface
            className="flex-1"
            showHeader={false}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-violet-50/30 via-white to-purple-50/30">
            <div className="text-center max-w-md">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-400 shadow-sm mx-auto">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">Please Select a Bot</h2>
              <p className="leading-relaxed text-slate-600">
                Use the dropdown box along the top of the screen to select a bot. Once you select a
                bot, you can begin chatting.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-shrink-0">
        <NotesSidebar />
      </div>
    </div>
  );
};

export default Chat;
