import React from 'react';

import { Circle, FileText, Target } from 'lucide-react';

import { useChapter } from '@/hooks/queries/useChapters';
import { useChapterLearningGoals } from '@/hooks/queries/useChat';

import { useChatStore } from '@/stores/core/chatStore';

import { Card } from '@/components/ui/card';

interface LearningGoalsDisplayProps {
  className?: string;
}

const LearningGoalsDisplay: React.FC<LearningGoalsDisplayProps> = ({ className = '' }) => {
  const { selectedBookId, selectedChapterId } = useChatStore();

  const {
    data: structuredGoals,
    isLoading: structuredLoading,
    error: structuredError,
  } = useChapterLearningGoals(selectedBookId, selectedChapterId);

  const { data: chapterData, isLoading: chapterLoading } = useChapter(
    selectedBookId || '',
    selectedChapterId || '',
    !!selectedBookId && !!selectedChapterId
  );

  if (!selectedBookId || !selectedChapterId) {
    return null;
  }

  const isLoading = structuredLoading || chapterLoading;

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="mb-4 flex items-center space-x-3">
          <Target className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-slate-800">Learning Goals</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-4 rounded bg-slate-200"></div>
              <div className="ml-6 space-y-1">
                <div className="h-3 w-4/5 rounded bg-slate-100"></div>
                <div className="h-3 w-3/5 rounded bg-slate-100"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const hasStructuredGoals = structuredGoals && structuredGoals.length > 0;

  const textBasedGoals = chapterData?.prompts?.learning_goals;
  const hasTextBasedGoals = textBasedGoals && textBasedGoals.trim().length > 0;

  if (structuredError && !hasTextBasedGoals) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="mb-4 flex items-center space-x-3">
          <Target className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-slate-800">Learning Goals</h3>
        </div>
        <div className="text-sm text-red-500">Error loading learning goals</div>
      </Card>
    );
  }

  if (!hasStructuredGoals && !hasTextBasedGoals) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="mb-4 flex items-center space-x-3">
          <Target className="h-5 w-5 text-slate-400" />
          <h3 className="font-semibold text-slate-800">Learning Goals</h3>
        </div>
        <div className="text-sm text-slate-500">
          No learning goals defined for this chapter yet.
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6 flex items-center space-x-3">
        <Target className="h-5 w-5 text-violet-500" />
        <h3 className="font-semibold text-slate-800">Learning Goals</h3>
        {hasStructuredGoals && (
          <span className="rounded-full bg-violet-100 px-2 py-1 text-xs text-violet-700">
            {structuredGoals.length} goal{structuredGoals.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {hasStructuredGoals &&
          structuredGoals.map((goal, index) => (
            <div key={goal.id} className="group">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-medium text-violet-700">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="mb-2 text-sm font-medium text-slate-800">{goal.title}</h4>

                  {goal.subgoals && goal.subgoals.length > 0 && (
                    <div className="ml-1 space-y-2">
                      {goal.subgoals.map(subgoal => (
                        <div key={subgoal.id} className="flex items-start space-x-2">
                          <Circle className="mt-1 h-3 w-3 flex-shrink-0 text-slate-400" />
                          <span className="text-sm text-slate-600">{subgoal.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

        {!hasStructuredGoals && hasTextBasedGoals && (
          <div className="group">
            <div className="flex items-start space-x-3">
              <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-500" />
              <div className="min-w-0 flex-1">
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                  {textBasedGoals}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="text-center text-xs text-slate-500">
          Your progress toward these goals is tracked automatically
        </div>
      </div>
    </Card>
  );
};

export default LearningGoalsDisplay;
