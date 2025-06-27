import React from 'react';
import { useChapterLearningGoals } from '@/hooks/queries/useChat';
import { useChatStore } from '@/stores/chatStore';
import { useChapter } from '@/hooks/queries/useChapters';
import { Target, Circle, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LearningGoalsDisplayProps {
    className?: string;
}

const LearningGoalsDisplay: React.FC<LearningGoalsDisplayProps> = ({ className = '' }) => {
    const { selectedBookId, selectedChapterId } = useChatStore();

    // Fetch structured learning goals first
    const { data: structuredGoals, isLoading: structuredLoading, error: structuredError } =
        useChapterLearningGoals(selectedBookId, selectedChapterId);

    // Fetch chapter details to get text-based learning goals as fallback
    const { data: chapterData, isLoading: chapterLoading } =
        useChapter(selectedBookId || '', selectedChapterId || '', !!selectedBookId && !!selectedChapterId);

    if (!selectedBookId || !selectedChapterId) {
        return null;
    }

    const isLoading = structuredLoading || chapterLoading;

    if (isLoading) {
        return (
            <Card className={`p-6 ${className}`}>
                <div className="flex items-center space-x-3 mb-4">
                    <Target className="w-5 h-5 text-violet-500" />
                    <h3 className="font-semibold text-slate-800">Learning Goals</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-slate-200 rounded mb-2"></div>
                            <div className="ml-6 space-y-1">
                                <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                                <div className="h-3 bg-slate-100 rounded w-3/5"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    // Check if we have structured learning goals
    const hasStructuredGoals = structuredGoals && structuredGoals.length > 0;

    // Check if we have text-based learning goals from prompts
    const textBasedGoals = chapterData?.prompts?.learning_goals;
    const hasTextBasedGoals = textBasedGoals && textBasedGoals.trim().length > 0;

    if (structuredError && !hasTextBasedGoals) {
        return (
            <Card className={`p-6 ${className}`}>
                <div className="flex items-center space-x-3 mb-4">
                    <Target className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-slate-800">Learning Goals</h3>
                </div>
                <div className="text-red-500 text-sm">
                    Error loading learning goals
                </div>
            </Card>
        );
    }

    if (!hasStructuredGoals && !hasTextBasedGoals) {
        return (
            <Card className={`p-6 ${className}`}>
                <div className="flex items-center space-x-3 mb-4">
                    <Target className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-800">Learning Goals</h3>
                </div>
                <div className="text-slate-500 text-sm">
                    No learning goals defined for this chapter yet.
                </div>
            </Card>
        );
    }

    return (
        <Card className={`p-6 ${className}`}>
            <div className="flex items-center space-x-3 mb-6">
                <Target className="w-5 h-5 text-violet-500" />
                <h3 className="font-semibold text-slate-800">Learning Goals</h3>
                {hasStructuredGoals && (
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full">
                        {structuredGoals.length} goal{structuredGoals.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {/* Render structured goals if available */}
                {hasStructuredGoals && structuredGoals.map((goal, index) => (
                    <div key={goal.id} className="group">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-slate-800 mb-2">{goal.title}</h4>

                                {goal.subgoals && goal.subgoals.length > 0 && (
                                    <div className="ml-1 space-y-2">
                                        {goal.subgoals.map((subgoal) => (
                                            <div key={subgoal.id} className="flex items-start space-x-2">
                                                <Circle className="w-3 h-3 text-slate-400 mt-1 flex-shrink-0" />
                                                <span className="text-sm text-slate-600">{subgoal.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Render text-based goals if no structured goals are available */}
                {!hasStructuredGoals && hasTextBasedGoals && (
                    <div className="group">
                        <div className="flex items-start space-x-3">
                            <FileText className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {textBasedGoals}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500 text-center">
                    Your progress toward these goals is tracked automatically
                </div>
            </div>
        </Card>
    );
};

export default LearningGoalsDisplay;