import React from 'react';

import { useChatBots } from '@/hooks/queries/useChat';

import { useConversationStore } from '@/stores/core/conversationStore';

import { Bot } from '@/types/bot';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BotSelector: React.FC = () => {
  const { data: bots, isLoading, error } = useChatBots();
  const { setActiveBot, currentBotId, clearActiveConversation } = useConversationStore();

  const handleBotChange = async (botId: string) => {
    clearActiveConversation();

    try {
      // Find the full bot object and set it directly
      const selectedBot = bots?.find(bot => bot.id.toString() === botId);
      if (selectedBot) {
        await setActiveBot(selectedBot);
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
        <div className="text-red-500 text-sm">Error loading bots: {error.message}</div>
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
            <SelectItem value="" disabled>
              No bots available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BotSelector;
