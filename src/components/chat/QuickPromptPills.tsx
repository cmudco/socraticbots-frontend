import React from 'react';

import type { BotQuickPrompt } from '@/types/bot';

interface QuickPromptPillsProps {
  quickPrompts: BotQuickPrompt[];
  onPromptClick: (promptText: string) => void;
  disabled?: boolean;
}

const QuickPromptPills: React.FC<QuickPromptPillsProps> = ({
  quickPrompts,
  onPromptClick,
  disabled = false,
}) => {
  if (!quickPrompts || quickPrompts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 pb-3">
      {quickPrompts.map(prompt => (
        <button
          key={prompt.id}
          type="button"
          onClick={() => onPromptClick(prompt.prompt)}
          disabled={disabled}
          className="bg-primary/10 text-primary hover:bg-primary/20 disabled:bg-muted disabled:text-muted-foreground inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed"
        >
          {prompt.title}
        </button>
      ))}
    </div>
  );
};

export default QuickPromptPills;
