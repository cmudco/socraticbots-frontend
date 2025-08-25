import React from 'react';

import { useBotFormStore } from '@/stores/forms/botFormStore';

interface BotPromptsTabProps {
  viewOnly?: boolean;
}

const BotPromptsTab: React.FC<BotPromptsTabProps> = ({ viewOnly = false }) => {
  const { greeting, chatPrompt, trackingPrompt, learningGoals, updateField } = useBotFormStore();

  return (
    <div className="space-y-6">
      <div>
        <label className="text-foreground mb-1 block text-sm font-medium">Greeting Message</label>
        <textarea
          disabled={viewOnly}
          value={greeting}
          onChange={e => updateField('greeting', e.target.value)}
          className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
          rows={3}
          placeholder="Enter the initial greeting message for users..."
        />
      </div>

      <div>
        <label className="text-foreground mb-1 block text-sm font-medium">Chat Prompt</label>
        <textarea
          disabled={viewOnly}
          value={chatPrompt}
          onChange={e => updateField('chatPrompt', e.target.value)}
          className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
          rows={4}
          placeholder="Enter the system prompt for chat interactions..."
        />
      </div>

      <div>
        <label className="text-foreground mb-1 block text-sm font-medium">Tracking Prompt</label>
        <textarea
          disabled={viewOnly}
          value={trackingPrompt}
          onChange={e => updateField('trackingPrompt', e.target.value)}
          className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
          rows={4}
          placeholder="Enter the prompt for tracking student progress..."
        />
      </div>

      <div>
        <label className="text-foreground mb-1 block text-sm font-medium">Learning Goals</label>
        <textarea
          disabled={viewOnly}
          value={learningGoals}
          onChange={e => updateField('learningGoals', e.target.value)}
          className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
          rows={4}
          placeholder="Define the learning objectives and goals for this bot..."
        />
      </div>
    </div>
  );
};

export default BotPromptsTab;
