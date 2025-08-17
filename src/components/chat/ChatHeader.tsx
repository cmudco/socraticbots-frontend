import React from 'react';

import { BookOpen, Clock, } from 'lucide-react';

import { useConversationStore } from '@/stores/core/conversationStore';

import { Badge } from '@/components/ui/badge';

import BotSelector from './BotSelector';

const ChatHeader: React.FC = () => {
  const { currentBotId } = useConversationStore();

  return (
    <header className="sticky top-0 z-10 w-full border-b border-slate-200/60 bg-gradient-to-r from-white via-slate-50/90 to-white shadow-sm backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-600">Bot:</span>
                  {currentBotId ? (
                    <Badge
                      variant="secondary"
                      className="border-violet-200 bg-violet-50 text-violet-700"
                    >
                      <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-violet-400"></div>
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-300 bg-slate-50 text-slate-600"
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Select Bot
                    </Badge>
                  )}
                </div>
                <div className="mt-1">
                  <BotSelector />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
