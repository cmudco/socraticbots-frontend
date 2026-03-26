import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useChatBots } from '@/hooks/queries/useChat';
import { useUser } from '@/hooks/queries/useUser';

import { useConversationStore } from '@/stores/core/conversationStore';

import { Badge } from '@/components/ui/badge';
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
  const { setActiveBot, currentBotId } = useConversationStore();
  const user = useUser();
  const navigate = useNavigate();

  const handleBotChange = async (botId: string) => {
    try {
      // Find the full bot object and set it directly
      const selectedBot = bots?.find(bot => bot.id.toString() === botId);
      if (selectedBot && selectedBot.isActive !== false) {
        // Only allow selection of active bots
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
        <div className="bg-muted h-10 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64">
        <div className="text-destructive text-sm">Error loading bots: {error.message}</div>
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
            bots.map((bot: Bot) => {
              const isCreator = user?.id === bot.createdById;
              const redeemed = !!bot.redeemed;
              const isInactive = bot.isActive === false;
              return (
                <SelectItem
                  key={bot.id}
                  value={bot.id.toString()}
                  disabled={isInactive}
                  className={isInactive ? 'cursor-not-allowed opacity-50' : ''}
                >
                  <div className="flex flex-col">
                    <span className={`font-medium ${isInactive ? 'text-muted-foreground' : ''}`}>
                      {bot.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{bot.subject}</span>
                      {isCreator && (
                        <Badge variant="default" className="h-4 px-1.5 py-0 text-[10px]">
                          Creator
                        </Badge>
                      )}
                      {redeemed && (
                        <Badge variant="green" className="h-4 px-1.5 py-0 text-[10px]">
                          Redeemed
                        </Badge>
                      )}
                      {isInactive && (
                        <Badge variant="destructive" className="h-4 px-1.5 py-0 text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </SelectItem>
              );
            })
          ) : (
            <div className="text-muted-foreground px-2 py-1.5 text-sm">No bots available</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BotSelector;
