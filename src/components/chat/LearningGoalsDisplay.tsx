import React from 'react';

import { Target } from 'lucide-react';

// import { useChapter } from '@/hooks/queries/useChapters'; // Temporarily disabled
// import { useChapterLearningGoals } from '@/hooks/queries/useChat'; // Temporarily disabled

import { useChatStore } from '@/stores/core/chatStore';

import { Card } from '@/components/ui/card';

interface LearningGoalsDisplayProps {
  className?: string;
}

const LearningGoalsDisplay: React.FC<LearningGoalsDisplayProps> = ({ className = '' }) => {
  const { selectedBookId, selectedChapterId } = useChatStore();

  // Temporarily disabled - will be rewritten for bots architecture
  // const {
  //   data: structuredGoals,
  //   isLoading: structuredLoading,
  //   error: structuredError,
  // } = useChapterLearningGoals(selectedBookId, selectedChapterId);

  // const { data: chapterData, isLoading: chapterLoading } = useChapter(
  //   selectedBookId || '',
  //   selectedChapterId || '',
  //   !!selectedBookId && !!selectedChapterId
  // );

  if (!selectedBookId || !selectedChapterId) {
    return null;
  }

  // Temporarily return placeholder
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4 flex items-center space-x-3">
        <Target className="h-5 w-5 text-slate-400" />
        <h3 className="font-semibold text-slate-800">Learning Goals</h3>
      </div>
      <p className="text-center text-sm text-slate-500">
        Learning goals will be available when chat module is updated for bots architecture.
      </p>
    </Card>
  );

};

export default LearningGoalsDisplay;
