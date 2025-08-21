import React from 'react';
import ReactMarkdown from 'react-markdown';

import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

import { useConversationStore } from '@/stores/core/conversationStore';
import { useIsProgressStreaming, useProgressTokens } from '@/stores/core/websocketStore';

import { Badge } from '@/components/ui/badge';

const TrackingSidebar: React.FC = () => {
  // Use the conversation store for bot and conversation context
  const { activeConversation, currentBotId, currentBot } = useConversationStore();
  const dareConversationId = activeConversation?.dareConversationId;
  
  // Use individual WebSocket selectors to avoid re-render loops
  const isProgressStreaming = useIsProgressStreaming();
  const progressTokens = useProgressTokens();

  if (!currentBotId || !dareConversationId) {
    return (
      <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
        <div className="border-b border-slate-200/60 px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Learning Progress</h2>
              <p className="text-sm text-slate-600">Track your progress and insights</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-4">
          <div className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-6 text-center shadow-sm backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Select a Bot</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Choose a bot to start tracking your learning progress.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        
        {/* Learning Goals Section */}
        {currentBot?.prompts?.learningGoals && (
          <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="border-b border-slate-200/60 px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <BookOpen className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Learning Goals</h3>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="prose prose-sm prose-slate max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 text-sm leading-relaxed text-slate-600">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start space-x-2 text-sm text-slate-600">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></div>
                        <span>{children}</span>
                      </li>
                    ),
                  }}
                >
                  {currentBot.prompts.learningGoals}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Progress Assessment Section */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
          <div className="border-b border-slate-200/60 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Progress Assessment</h3>
              </div>
              <div className="flex items-center space-x-2">
                {isProgressStreaming && (
                  <Badge
                    variant="secondary"
                    className="animate-pulse border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-emerald-400 border-t-transparent"></div>
                    Analyzing...
                  </Badge>
                )}
              </div>
            </div>
          </div>
                    <div className="px-4 py-3">
            {!progressTokens.length && !isProgressStreaming ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                  <Lightbulb className="h-6 w-6 text-slate-400" />
                </div>
                <h4 className="mb-2 text-sm font-medium text-slate-700">No Progress Data Yet</h4>
                <p className="mb-4 text-xs text-slate-500">
                  Start chatting to get personalized feedback on your learning progress
                </p>
                <Badge variant="outline" className="bg-slate-50">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  Begin Learning
                </Badge>
              </div>
            ) : (
              <div className="space-y-4">
                {(isProgressStreaming || progressTokens.length > 0) && (
                  <div className="space-y-4">
                    <div className="prose prose-sm prose-slate max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-4 flex items-center rounded-lg border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 p-3 text-base font-bold text-slate-800">
                              <TrendingUp className="mr-2 h-4 w-4 flex-shrink-0 text-emerald-600" />
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="mt-5 mb-3 flex items-center text-sm font-semibold text-slate-700">
                              <div className="mr-2 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400"></div>
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="mt-4 mb-2 flex items-center text-sm font-medium text-slate-600">
                              <div className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400"></div>
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-3 text-sm leading-relaxed text-slate-600">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-4 space-y-2 rounded-lg bg-slate-50/50 p-3">
                              {children}
                            </ul>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start space-x-2 text-sm text-slate-600">
                              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500"></div>
                              <span>{children}</span>
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong className="rounded bg-yellow-50 px-1 font-semibold text-slate-800">
                              {children}
                            </strong>
                          ),
                          blockquote: ({ children }) => (
                            <div className="my-4 rounded-r-lg border-l-4 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 p-4">
                              <div className="text-sm font-medium text-slate-700">{children}</div>
                            </div>
                          ),
                        }}
                      >
                        {progressTokens.join('')}
                      </ReactMarkdown>
                    </div>
                    
                    {isProgressStreaming && (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
                        <span className="text-xs font-medium text-emerald-600">
                          Generating assessment...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {isProgressStreaming && progressTokens.length === 0 && (
                  <div className="space-y-4 py-6">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500"></div>
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        Analyzing your progress...
                      </p>
                      <p className="text-xs text-slate-500">This may take a few moments</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {progressTokens.length > 0 && !isProgressStreaming && (
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-violet-50 to-purple-50 shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Progress Active</span>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  Updated
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200/60 bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
          <span>Progress updates automatically as you chat</span>
        </div>
      </div>
    </div>
  );
};

export default TrackingSidebar;
