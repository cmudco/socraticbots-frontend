import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useChatBots } from '@/hooks/queries/useChat';
import { useUserInfo } from '@/hooks/queries/useUser';

import { useConversationStore } from '@/stores/core/conversationStore';

import ChatHeader from '@/components/chat/ChatHeader';
import TrackingSidebar from '@/components/chat/TrackingSidebar';
import BotChatInterface from '@/components/chat/bot/BotChatInterface';
import NotesSidebar from '@/components/chat/notes/NotesSidebar';

const Chat: React.FC = () => {
  const { data: user, isLoading } = useUserInfo();
  const {
    currentBotId,
    currentBot,
    isLoadingBot,
    setActiveBot,
    clearActiveConversation,
    isProgressSidebarVisible,
    setProgressSidebarVisible,
  } = useConversationStore();
  const { botId } = useParams();
  const { data: bots } = useChatBots();

  // Check if tracking is enabled for the current bot
  const isTrackingEnabled = currentBot?.modelPreference?.trackingModelDareId != null;

  useEffect(() => {
    if (!botId) {
      if (currentBotId) {
        clearActiveConversation();
      }
      return;
    }

    if (!bots || bots.length === 0 || isLoadingBot) return;
    const selected = bots.find(b => b.id.toString() === botId);
    if (selected && selected.id !== currentBotId) {
      setActiveBot(selected);
    }
  }, [botId, bots, currentBotId, isLoadingBot, setActiveBot, clearActiveConversation]);

  // Show loading while fetching user data
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  return (
    <div className="from-primary/5 via-background to-secondary/5 flex h-full w-full overflow-hidden bg-gradient-to-br">
      {/* Tracking Sidebar with toggle */}
      {isTrackingEnabled && (
        <div className="relative">
          {isProgressSidebarVisible && (
            <div className="border-border/60 bg-background/90 w-80 min-w-0 flex-shrink-0 overflow-y-auto border-r backdrop-blur-sm">
              <TrackingSidebar />
            </div>
          )}

          {/* Toggle button - positioned slightly inward from border */}
          <button
            onClick={() => setProgressSidebarVisible(!isProgressSidebarVisible)}
            className="bg-background hover:bg-muted border-border/60 absolute top-[70px] -right-6 z-50 flex h-6 w-6 items-center justify-center rounded-lg border shadow-md transition-colors"
            aria-label={isProgressSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
          >
            {isProgressSidebarVisible ? (
              <ChevronLeft className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        </div>
      )}

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Always show the header with bot selector */}
        <div className="flex-shrink-0">
          <ChatHeader />
        </div>

        {currentBotId ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <BotChatInterface className="h-full" />
          </div>
        ) : (
          <div className="from-primary/5 via-background to-secondary/5 flex flex-1 items-center justify-center bg-gradient-to-br">
            <div className="max-w-md text-center">
              <div className="from-primary to-primary/80 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm">
                <svg
                  className="text-primary-foreground h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                  />
                </svg>
              </div>
              <h2 className="text-foreground mb-3 text-xl font-semibold">Please Select a Bot</h2>
              <p className="text-muted-foreground leading-relaxed">
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
