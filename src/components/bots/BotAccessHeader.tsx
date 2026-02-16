import React from 'react';

import { ArrowLeft, Globe, UserCheck } from 'lucide-react';

import {
  AnonymousConversationsResponse,
  BotAccessUsersResponse,
} from '@/services/botAccess.service';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Bot } from '@/types/bot';

interface BotAccessHeaderProps {
  bot: Bot;
  accessData: BotAccessUsersResponse;
  anonymousData: AnonymousConversationsResponse | null;
  activeTab: 'users' | 'anonymous';
  onTabChange: (tab: 'users' | 'anonymous') => void;
  onBack: () => void;
}

const BotAccessHeader: React.FC<BotAccessHeaderProps> = ({
  bot,
  accessData,
  anonymousData,
  activeTab,
  onTabChange,
  onBack,
}) => {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bots
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Bot Access Management</h1>
            <div className="text-muted-foreground">
              <p className="text-lg">
                <span className="font-semibold">{bot.title}</span>
                {bot.isPubliclyDeployed && (
                  <Badge
                    variant="outline"
                    className="ml-2 border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/50 dark:text-green-200"
                  >
                    <Globe className="mr-1 h-3 w-3" />
                    Public
                  </Badge>
                )}
              </p>
              <p className="text-sm">
                {bot.botGroup.title} • {bot.subject} • {bot.topic}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-primary text-2xl font-bold">{accessData.totalCount}</div>
              <div className="text-muted-foreground text-sm">Authenticated Users</div>
            </div>
            {bot.isPubliclyDeployed && anonymousData && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {anonymousData.totalCount}
                </div>
                <div className="text-muted-foreground text-sm">Anonymous Sessions</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      {bot.isPubliclyDeployed && (
        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => onTabChange('users')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="mr-2 inline-block h-4 w-4" />
            Authenticated Users ({accessData.totalCount})
          </button>
          <button
            onClick={() => onTabChange('anonymous')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'anonymous'
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="mr-2 inline-block h-4 w-4" />
            Anonymous Sessions ({anonymousData?.totalCount || 0})
          </button>
        </div>
      )}
    </>
  );
};

export default BotAccessHeader;
