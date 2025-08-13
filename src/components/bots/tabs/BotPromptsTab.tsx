import React from 'react';

import { useBotFormStore } from '@/stores/forms/botFormStore';

interface BotPromptsTabProps {
  viewOnly?: boolean;
}

const BotPromptsTab: React.FC<BotPromptsTabProps> = ({ viewOnly = false }) => {
  const { 
    greeting, 
    chatPrompt, 
    trackingPrompt, 
    learningGoals, 
    updateField 
  } = useBotFormStore();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Greeting Message
        </label>
        <textarea
          disabled={viewOnly}
          value={greeting}
          onChange={(e) => updateField('greeting', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={3}
          placeholder="Enter the initial greeting message for users..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chat Prompt
        </label>
        <textarea
          disabled={viewOnly}
          value={chatPrompt}
          onChange={(e) => updateField('chatPrompt', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={4}
          placeholder="Enter the system prompt for chat interactions..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tracking Prompt
        </label>
        <textarea
          disabled={viewOnly}
          value={trackingPrompt}
          onChange={(e) => updateField('trackingPrompt', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={4}
          placeholder="Enter the prompt for tracking student progress..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Learning Goals
        </label>
        <textarea
          disabled={viewOnly}
          value={learningGoals}
          onChange={(e) => updateField('learningGoals', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={4}
          placeholder="Define the learning objectives and goals for this bot..."
        />
      </div>
    </div>
  );
};

export default BotPromptsTab;