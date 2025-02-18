import React from 'react';

interface AdvancedSettingsProps {
  advancedFields: {
    greeting: string;
    teaching_style: string;
    qa_instructions: string;
    restrictions: string;
    progress_tracker: string;
  };
  onFieldChange: (field: string, value: string) => void;
  chapterId: string;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  advancedFields,
  onFieldChange,
  chapterId,
}) => {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Greeting
        </label>
        <textarea
          value={advancedFields.greeting}
          onChange={(e) => onFieldChange('greeting', e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-socratic focus:border-socratic h-[200px]"
        />
      </div>

      {/* Teaching Style */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Teaching Style
        </label>
        <textarea
          value={advancedFields.teaching_style}
          onChange={(e) => onFieldChange('teaching_style', e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-socratic focus:border-socratic h-[200px]"
        />
      </div>

      {/* QA Instructions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          QA Instructions
        </label>
        <textarea
          value={advancedFields.qa_instructions}
          onChange={(e) => onFieldChange('qa_instructions', e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-socratic focus:border-socratic h-[200px]"
        />
      </div>

      {/* Restrictions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Restrictions
        </label>
        <textarea
          value={advancedFields.restrictions}
          onChange={(e) => onFieldChange('restrictions', e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-socratic focus:border-socratic h-[200px]"
        />
      </div>

      {/* Progress Tracker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Progress Tracker
        </label>
        <textarea
          value={advancedFields.progress_tracker}
          onChange={(e) => onFieldChange('progress_tracker', e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-socratic focus:border-socratic h-[200px]"
        />
      </div>
    </div>
  );
};

export default AdvancedSettings;
