// src/components/chapters/tabs/LearningGoalsTab.tsx
import React from 'react';
import { useChapterFormStore } from '../../../stores/chapterFormStore';

const LearningGoalsTab: React.FC = () => {
  const { learning_goals, updateField } = useChapterFormStore();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField('learning_goals', e.target.value);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Learning Goals</h3>
        <p className="text-sm text-gray-600 mb-4">
          Define the learning objectives for this chapter. Enter each goal on a new line.
        </p>
        <textarea
          value={learning_goals}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
          rows={10}
          placeholder="Enter learning goals, one per line..."
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Write clear, specific objectives</li>
          <li>• Use action verbs like "understand", "analyze", "create"</li>
          <li>• Make goals measurable and achievable</li>
        </ul>
      </div>
    </div>
  );
};

export default LearningGoalsTab;
