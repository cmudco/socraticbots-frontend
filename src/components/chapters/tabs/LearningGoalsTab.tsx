// src/components/chapters/tabs/LearningGoalsTab.tsx
import React from 'react';

import { useChapterFormStore } from '../../../stores/forms/chapterFormStore';

const LearningGoalsTab: React.FC = () => {
  const { learning_goals, updateField } = useChapterFormStore();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField('learning_goals', e.target.value);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-medium">Learning Goals</h3>
        <p className="mb-4 text-sm text-gray-600">
          Define the learning objectives for this chapter. Enter each goal on a new line.
        </p>
        <textarea
          value={learning_goals}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          rows={10}
          placeholder="Enter learning goals, one per line..."
        />
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="mb-2 font-medium text-blue-900">Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Write clear, specific objectives</li>
          <li>• Use action verbs like "understand", "analyze", "create"</li>
          <li>• Make goals measurable and achievable</li>
        </ul>
      </div>
    </div>
  );
};

export default LearningGoalsTab;
