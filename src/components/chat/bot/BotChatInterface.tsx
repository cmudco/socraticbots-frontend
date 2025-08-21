import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { useConversationStore } from '@/stores/core/conversationStore';
import { useUserInfo } from '@/hooks/queries/useUser';

import { Card } from '@/components/ui/card';
import BotMessageList from './BotMessageList';
import BotChatInput from './BotChatInput';

interface BotChatInterfaceProps {
  className?: string;
}

const BotChatInterface: React.FC<BotChatInterfaceProps> = ({ 
  className = ''
}) => {
  const { data: user } = useUserInfo();
  const { 
    currentBotId, 
    activeConversation, 
    isLoadingMessages,
    clearActiveConversation 
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
      <Card className={`flex flex-col h-[600px] ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-slate-600">Initializing chat with Bot {currentBotId}...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`flex flex-col bg-white h-full min-h-0 ${className}`}>
      {/* Messages - with min-h-0 to allow proper flex shrinking */}
      <BotMessageList className="flex-1 min-h-0" />

      {/* Input - fixed at bottom */}
      <div className="flex-shrink-0">
        <BotChatInput />
      </div>
    </div>
  );
};

export default BotChatInterface;