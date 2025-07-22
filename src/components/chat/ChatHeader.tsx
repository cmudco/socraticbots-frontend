import React from 'react';

import { BookOpen, Clock, Sparkles } from 'lucide-react';

import { useChatStore } from '@/stores/core/chatStore';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import ChapterSelector from './ChapterSelector';

const ChatHeader: React.FC = () => {
  const { selectedChapterId } = useChatStore();

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
                  {selectedChapterId ? (
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
                  <ChapterSelector />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600">Mode:</span>
              <div className="flex items-center space-x-1 rounded-lg bg-slate-100/80 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!selectedChapterId}
                  className={`h-8 px-3 text-xs font-medium transition-all ${
                    selectedChapterId
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm hover:from-violet-600 hover:to-purple-600'
                      : 'cursor-not-allowed bg-slate-200 text-slate-400'
                  }`}
                >
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  Classic
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={true}
                  className="h-8 cursor-not-allowed bg-slate-200 px-3 text-xs font-medium text-slate-400"
                >
                  New
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-4 border-amber-200 bg-amber-100 px-1.5 text-xs text-amber-700"
                  >
                    Soon
                  </Badge>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {selectedChapterId && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
              <span className="text-slate-600">Ready to chat</span>
            </div>
            <div className="text-xs text-slate-500">AI assistant ready • Learning mode active</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
