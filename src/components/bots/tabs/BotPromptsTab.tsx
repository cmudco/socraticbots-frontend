import React from 'react';

import { Info } from 'lucide-react';

import { useBotFormStore } from '@/stores/forms/botFormStore';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

interface BotPromptsTabProps {
  viewOnly?: boolean;
}

const BotPromptsTab: React.FC<BotPromptsTabProps> = ({ viewOnly = false }) => {
  const {
    greeting,
    chatPrompt,
    trackingPrompt,
    learningGoals,
    updateField,
    isAdvanced,
    setIsAdvanced,
  } = useBotFormStore();

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

      <div className="flex items-center gap-3">
        <Switch
          id="advanced-prompt-toggle"
          checked={!!isAdvanced}
          onCheckedChange={(val: boolean) => setIsAdvanced(val)}
          disabled={viewOnly}
        />
        <label htmlFor="advanced-prompt-toggle" className="text-foreground/80 text-sm select-none">
          Advanced Prompt
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="What is Advanced Prompt?"
            >
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-sm" align="start">
            Uses an expanded system prompt that includes conversation history, subject/topic,
            learning goals, relevant content, and your chat prompt for deeper responses.
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default BotPromptsTab;
