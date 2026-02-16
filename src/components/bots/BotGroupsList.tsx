import React from 'react';

import { Bot as BotIcon, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Bot } from '@/types/bot';
import { BotGroupDetail } from '@/types/botGroup';

interface BotGroupsListProps {
  botGroups: BotGroupDetail[];
  onBotSelect: (botGroupId: number, botId: number) => void;
}

const BotGroupsList: React.FC<BotGroupsListProps> = ({ botGroups, onBotSelect }) => {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Bot Access Management</h1>
        <p className="text-muted-foreground">Select a bot to manage user access and permissions</p>
      </div>

      {botGroups.length > 0 ? (
        <div className="space-y-6">
          {botGroups.map(group => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="text-xl">{group.title}</CardTitle>
                {group.description && <p className="text-muted-foreground">{group.description}</p>}
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-border dark:divide-border/50 divide-y">
                  {group.bots && group.bots.length > 0 ? (
                    group.bots.map((bot: Bot) => (
                      <div
                        key={bot.id}
                        className="hover:bg-accent/50 dark:hover:bg-accent/20 cursor-pointer px-6 py-4 transition-colors"
                        onClick={() => onBotSelect(group.id, bot.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <BotIcon className="text-primary h-5 w-5" />
                            <div>
                              <h3 className="text-sm font-medium">{bot.title}</h3>
                              <p className="text-muted-foreground text-xs">
                                {bot.subject} • {bot.topic}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="text-muted-foreground h-5 w-5" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground px-6 py-4 text-center">
                      No bots in this group
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BotIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No bot groups found</h3>
            <p className="text-muted-foreground">
              Create bot groups and bots to start managing access.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BotGroupsList;
