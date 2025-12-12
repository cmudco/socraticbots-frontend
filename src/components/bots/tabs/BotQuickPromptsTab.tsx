import React from 'react';

import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { QuickPromptFormItem, useBotFormStore } from '@/stores/forms/botFormStore';

import { Button } from '@/components/ui/button';

interface BotQuickPromptsTabProps {
  viewOnly?: boolean;
}

const BotQuickPromptsTab: React.FC<BotQuickPromptsTabProps> = ({ viewOnly = false }) => {
  const { quickPrompts, addQuickPrompt, updateQuickPrompt, removeQuickPrompt } = useBotFormStore();

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-foreground text-sm font-medium">Quick Prompts</h3>
            <p className="text-muted-foreground text-xs">
              Add template prompts that appear as clickable pills above the chat input.
            </p>
          </div>
          {!viewOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuickPrompt}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Prompt
            </Button>
          )}
        </div>

        {quickPrompts.length === 0 ? (
          <div className="border-border/60 bg-muted/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8">
            <p className="text-muted-foreground text-sm">No quick prompts configured</p>
            {!viewOnly && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addQuickPrompt}
                className="mt-2"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add your first quick prompt
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {quickPrompts.map((prompt, index) => (
              <QuickPromptItem
                key={prompt.id ?? `new-${index}`}
                prompt={prompt}
                index={index}
                viewOnly={viewOnly}
                onUpdate={updateQuickPrompt}
                onRemove={removeQuickPrompt}
              />
            ))}
          </div>
        )}
      </div>

      {quickPrompts.length > 0 && (
        <p className="text-muted-foreground text-xs">
          💡 Tip: Keep pill titles short (1-3 words) for better display. The full prompt text will
          be inserted into the chat when users click the pill.
        </p>
      )}
    </div>
  );
};

interface QuickPromptItemProps {
  prompt: QuickPromptFormItem;
  index: number;
  viewOnly: boolean;
  onUpdate: (index: number, field: keyof QuickPromptFormItem, value: string | number) => void;
  onRemove: (index: number) => void;
}

const QuickPromptItem: React.FC<QuickPromptItemProps> = ({
  prompt,
  index,
  viewOnly,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="border-border bg-card group relative rounded-lg border p-4">
      <div className="flex items-start gap-3">
        {/* Drag handle (visual only for now) */}
        <div className="text-muted-foreground/50 hover:text-muted-foreground mt-2 cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {/* Title input */}
          <div>
            <label className="text-foreground mb-1 block text-xs font-medium">Pill Label</label>
            <input
              type="text"
              disabled={viewOnly}
              value={prompt.title}
              onChange={e => onUpdate(index, 'title', e.target.value)}
              maxLength={100}
              className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
              placeholder="e.g., Explain this concept"
            />
          </div>

          {/* Prompt textarea */}
          <div>
            <label className="text-foreground mb-1 block text-xs font-medium">Prompt Text</label>
            <textarea
              disabled={viewOnly}
              value={prompt.prompt}
              onChange={e => onUpdate(index, 'prompt', e.target.value)}
              className="border-input focus:border-ring focus:ring-ring disabled:bg-muted w-full resize-none rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed"
              rows={3}
              placeholder="Enter the full prompt that will be inserted when the user clicks this pill..."
            />
          </div>
        </div>

        {/* Delete button */}
        {!viewOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BotQuickPromptsTab;
