import React from 'react';

import { Info } from 'lucide-react';

import { useBotFormStore } from '@/stores/forms/botFormStore';

import HistoryWindowSlider from '@/components/bots/HistoryWindowSlider';
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
    trackingModelDareId,
    updateField,
    isAdvanced,
    setIsAdvanced,
    chatHistoryLimit,
    trackingHistoryLimit,
    setHistoryLimit,
  } = useBotFormStore();

  const isTrackingEnabled = trackingModelDareId !== null && trackingModelDareId !== undefined;

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

      <HistoryWindowSlider
        id="chat-history-limit"
        label="Chat History"
        description="How much of the conversation the bot rereads before each reply. Shorter windows cost less on long chats but forget earlier answers."
        value={chatHistoryLimit}
        onChange={value => setHistoryLimit('chatHistoryLimit', value)}
        disabled={viewOnly}
      />

      <div>
        <label className="text-foreground mb-1 block text-sm font-medium">
          Tracking Prompt
          {!isTrackingEnabled && (
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              (Requires Progress Tracker to be selected)
            </span>
          )}
        </label>
        <textarea
          disabled={viewOnly || !isTrackingEnabled}
          value={trackingPrompt}
          onChange={e => updateField('trackingPrompt', e.target.value)}
          className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
          rows={4}
          placeholder={
            isTrackingEnabled
              ? 'Enter the prompt for tracking student progress...'
              : 'Select a Progress Tracker in Basic Info to enable this field'
          }
        />
      </div>

      <HistoryWindowSlider
        id="tracking-history-limit"
        label="Tracker History"
        description="How much of the conversation the progress tracker reads when it assesses the student."
        value={trackingHistoryLimit}
        onChange={value => setHistoryLimit('trackingHistoryLimit', value)}
        disabled={viewOnly || !isTrackingEnabled}
      />

      <div>
        <label className="text-foreground mb-1 block text-sm font-medium">
          Learning Goals
          {!isTrackingEnabled && (
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              (Requires Progress Tracker to be selected)
            </span>
          )}
        </label>
        <textarea
          disabled={viewOnly || !isTrackingEnabled}
          value={learningGoals}
          onChange={e => updateField('learningGoals', e.target.value)}
          className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
          rows={4}
          placeholder={
            isTrackingEnabled
              ? 'Define the learning objectives and goals for this bot...'
              : 'Select a Progress Tracker in Basic Info to enable this field'
          }
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
