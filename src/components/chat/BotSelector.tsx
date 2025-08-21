import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useChatBots } from '@/hooks/queries/useChat';

import { useConversationStore } from '@/stores/core/conversationStore';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Bot } from '@/types/bot';

const BotSelector: React.FC = () => {
  const { data: bots, isLoading, error } = useChatBots();
  const { setActiveBot, currentBotId, clearActiveConversation } = useConversationStore();
  const navigate = useNavigate();

  const handleBotChange = async (botId: string) => {
    clearActiveConversation();

    try {
      // Find the full bot object and set it directly
      const selectedBot = bots?.find(bot => bot.id.toString() === botId);
      if (selectedBot) {
        await setActiveBot(selectedBot);
        navigate(`/chat/${botId}`);
      }
    } catch (error) {
      console.error('Error setting active bot:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-64">
        <div className="h-10 animate-pulse rounded-md bg-gray-200"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64">
        <div className="text-sm text-red-500">Error loading bots: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="w-64">
      <Select value={currentBotId?.toString() || ''} onValueChange={handleBotChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a bot..." />
        </SelectTrigger>
        <SelectContent>
          {bots && bots.length > 0 ? (
            bots.map((bot: Bot) => (
              <SelectItem key={bot.id} value={bot.id.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{bot.title}</span>
                  <span className="text-xs text-gray-500">{bot.subject}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-gray-500">No bots available</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BotSelector;
