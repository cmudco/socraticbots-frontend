import React, { useEffect } from 'react';

import { Loader2 } from 'lucide-react';

import { useUserInfo } from '@/hooks/queries/useUser';

import { useConversationStore } from '@/stores/core/conversationStore';

import { Card } from '@/components/ui/card';

import BotChatInput from './BotChatInput';
import BotMessageList from './BotMessageList';

interface BotChatInterfaceProps {
  className?: string;
}

const BotChatInterface: React.FC<BotChatInterfaceProps> = ({ className = '' }) => {
  const { data: user } = useUserInfo();
  const {
    currentBotId,
    currentBot,
    activeConversation,
    isLoadingMessages,
    clearActiveConversation,
  } = useConversationStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearActiveConversation();
    };
  }, [clearActiveConversation]);

  // Don't render if no current bot selected
  if (!currentBotId) {
    return null;
  }

  // Don't render if no user
  if (!user) {
    return null;
  }

  // Loading state while initializing
  if (!activeConversation && isLoadingMessages) {
    return (
      <Card className={`flex h-[600px] flex-col ${className}`}>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <span className="text-muted-foreground">
              Initializing chat with {currentBot?.title ?? ``}...
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`bg-background flex h-full min-h-0 flex-col ${className}`}>
      {/* Messages - with min-h-0 to allow proper flex shrinking */}
      <BotMessageList className="min-h-0 flex-1" />

      {/* Input - fixed at bottom */}
      <div className="flex-shrink-0">
        <BotChatInput />
      </div>
    </div>
  );
};

export default BotChatInterface;
