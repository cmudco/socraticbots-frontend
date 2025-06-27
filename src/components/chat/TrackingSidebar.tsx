// src/components/chat/TrackingSidebar.tsx
import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useTrackingProgress } from '@/hooks/queries/useChat';
import ReactMarkdown from 'react-markdown';
import { TrendingUp, Target, Circle, BookOpen } from 'lucide-react';
import LearningGoalsDisplay from './LearningGoalsDisplay';

const TrackingSidebar: React.FC = () => {
  const { selectedConversationId } = useChatStore();
  const { data: progressData, isLoading: progressLoading, error: progressError } = useTrackingProgress(selectedConversationId);

  if (!selectedConversationId) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            <h3 className="font-semibold text-slate-800">Learning Dashboard</h3>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Select a chapter to view your learning dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-violet-500" />
          <h3 className="font-semibold text-slate-800">Learning Dashboard</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">

          {/* Learning Goals Section */}
          <div>
            <LearningGoalsDisplay />
          </div>

          {/* Progress Tracking Section */}
          <div className="bg-white border border-slate-200/60 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h4 className="font-semibold text-slate-800">Progress Assessment</h4>
            </div>

            {progressLoading ? (
              <div className="space-y-3">
                <div className="w-8 h-8 mx-auto border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm text-center">Analyzing progress...</p>
              </div>
            ) : progressError ? (
              <div className="text-center">
                <Circle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <p className="text-red-500 text-sm">Error loading progress assessment</p>
              </div>
            ) : !progressData || !progressData.content ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-sm mb-2">
                  No progress assessment yet
                </p>
                <p className="text-slate-400 text-xs">
                  Start chatting to get personalized feedback on your learning progress
                </p>
              </div>
            ) : (
              <div className="prose prose-sm prose-slate max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 text-emerald-500 mr-2" />
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-sm font-medium text-slate-700 mb-2 mt-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-medium text-slate-600 mb-2 mt-3">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-1 mb-4">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start space-x-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-medium text-slate-800">{children}</strong>
                    ),
                    blockquote: ({ children }) => (
                      <div className="bg-emerald-50 border-l-4 border-emerald-200 p-3 my-3 rounded-r">
                        <div className="text-sm text-slate-700">{children}</div>
                      </div>
                    ),
                  }}
                >
                  {progressData.content}
                </ReactMarkdown>

                {progressData.created_at && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      Last updated: {new Date(progressData.created_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/60 bg-slate-50/50">
        <div className="text-xs text-slate-500 text-center">
          Progress updates automatically as you chat
        </div>
      </div>
    </div>
  );
};

export default TrackingSidebar;
