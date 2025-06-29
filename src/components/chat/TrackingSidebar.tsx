// src/components/chat/TrackingSidebar.tsx
import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useTrackingProgress, useStreamProgressTracking } from '@/hooks/queries/useChat';
import ReactMarkdown from 'react-markdown';
import { 
  TrendingUp, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const TrackingSidebar: React.FC = () => {
  const { selectedConversationId } = useChatStore();
  const { data: progressData, isLoading: progressLoading, error: progressError } = useTrackingProgress(selectedConversationId);
  const { streamProgressTracking } = useStreamProgressTracking();
  
  // Get progress streaming state from Zustand store
  const { isProgressStreaming, progressTokens, setProgressStreaming, addProgressToken, clearProgressTokens } = useChatStore();

  if (!selectedConversationId) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Learning Progress</CardTitle>
                <CardDescription className="text-slate-600">Track your progress and insights</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-sm w-full border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Select a Chapter</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Choose a chapter from the dropdown to start tracking your learning progress and get personalized insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50/30">

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">

        <Card className="border-0 gap-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-800">Progress Assessment</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {isProgressStreaming && (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Analyzing...
                  </Badge>
                )}
                {!isProgressStreaming && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Use the Zustand store for manual refresh
                      setProgressStreaming(true);
                      clearProgressTokens();
                      streamProgressTracking(selectedConversationId);
                    }}
                    className="h-7 w-7 p-0 hover:bg-emerald-50"
                    disabled={isProgressStreaming}
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                  </Button>
                )}
                {progressData?.created_at && !isProgressStreaming && (
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(progressData.created_at).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {progressLoading ? (
              <div className="space-y-4 py-6">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-slate-700">Loading progress...</p>
                  <p className="text-xs text-slate-500">Fetching your latest assessment</p>
                </div>
                <Progress value={33} className="w-full" />
              </div>
            ) : progressError ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="text-sm font-medium text-red-700 mb-1">Error Loading Progress</h4>
                <p className="text-xs text-red-600">Unable to load your progress assessment</p>
              </div>
            ) : !progressData || !progressData.content ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">No Progress Data Yet</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Start chatting to get personalized feedback on your learning progress
                </p>
                <Badge variant="outline" className="bg-slate-50">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Begin Learning
                </Badge>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show streaming progress if active */}
                {isProgressStreaming && progressTokens.length > 0 && (
                  <div className="space-y-4">
                    <div className="prose prose-sm prose-slate max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-base font-bold text-slate-800 mb-4 flex items-center bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border-l-4 border-emerald-400">
                              <TrendingUp className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-sm font-semibold text-slate-700 mb-3 mt-5 flex items-center">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 flex-shrink-0"></div>
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-medium text-slate-600 mb-2 mt-4 flex items-center">
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2 flex-shrink-0"></div>
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="space-y-2 mb-4 bg-slate-50/50 p-3 rounded-lg">{children}</ul>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start space-x-2 text-sm text-slate-600">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{children}</span>
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-slate-800 bg-yellow-50 px-1 rounded">{children}</strong>
                          ),
                          blockquote: ({ children }) => (
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-300 p-4 my-4 rounded-r-lg">
                              <div className="text-sm text-slate-700 font-medium">{children}</div>
                            </div>
                          ),
                        }}
                      >
                        {progressTokens.join('')}
                      </ReactMarkdown>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-emerald-600 font-medium">Generating assessment...</span>
                    </div>
                  </div>
                )}

                {/* Show final progress data when not streaming */}
                {!isProgressStreaming && progressData?.content && (
                  <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-base font-bold text-slate-800 mb-4 flex items-center bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border-l-4 border-emerald-400">
                            <TrendingUp className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm font-semibold text-slate-700 mb-3 mt-5 flex items-center">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 flex-shrink-0"></div>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-medium text-slate-600 mb-2 mt-4 flex items-center">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2 flex-shrink-0"></div>
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-2 mb-4 bg-slate-50/50 p-3 rounded-lg">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="flex items-start space-x-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-slate-800 bg-yellow-50 px-1 rounded">{children}</strong>
                        ),
                        blockquote: ({ children }) => (
                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-300 p-4 my-4 rounded-r-lg">
                            <div className="text-sm text-slate-700 font-medium">{children}</div>
                          </div>
                        ),
                      }}
                    >
                      {progressData.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Show loading state when streaming but no tokens yet */}
                {isProgressStreaming && progressTokens.length === 0 && (
                  <div className="space-y-4 py-6">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-slate-700">Analyzing your progress...</p>
                      <p className="text-xs text-slate-500">This may take a few moments</p>
                    </div>
                  </div>
                )}

                {progressData.created_at && !isProgressStreaming && (
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Last updated</span>
                      <span className="font-medium">{new Date(progressData.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {progressData?.content && !isProgressStreaming && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-violet-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Progress Active</span>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  Updated
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span>Progress updates automatically as you chat</span>
        </div>
      </div>
    </div>
  );
};

export default TrackingSidebar;
