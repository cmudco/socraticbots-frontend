import React from 'react';

import { cn } from '@/lib/utils';

interface BotThemedMessageProps {
  content: string;
  role: 'user' | 'assistant';
  className?: string;
}

/**
 * Example component showing how to use bot theme classes
 * User messages get primary color, assistant messages get accent color
 */
export const BotThemedMessage: React.FC<BotThemedMessageProps> = ({ content, role, className }) => {
  return (
    <div className={cn('flex', role === 'user' ? 'justify-end' : 'justify-start', className)}>
      <div
        className={cn(
          'max-w-[80%] px-4 py-2 shadow-sm',
          // Use bot theme colors from CSS variables
          role === 'user'
            ? 'bg-bot-primary text-white'
            : 'bg-bot-accent text-bot-fg border-bot-accent border',
          // Border radius comes from bot theme (applied via parent)
          'rounded-lg'
        )}
      >
        <p className="break-words whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

export default BotThemedMessage;
