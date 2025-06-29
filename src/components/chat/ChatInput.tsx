import React from 'react';

import { Send, Square } from 'lucide-react';

import { Button } from '@/components/ui/button';

import AnimatedDots from './AnimatedDots';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled = false,
  inputRef,
}) => {
  const getPlaceholder = () => {
    if (isStreaming) return 'AI is responding...';
    if (disabled) return 'Please select a chapter first';
    return 'Ask me anything about this chapter...';
  };

  const canSend = !disabled && !isStreaming && value.trim().length > 0;

  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm transition-all duration-200 focus-within:border-violet-400 focus-within:shadow-md hover:border-slate-300/60">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && canSend) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder={getPlaceholder()}
        disabled={disabled || isStreaming}
        className="flex-1 border-none bg-transparent text-base outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
        aria-label="Chat message input"
        autoComplete="off"
      />

      {isStreaming ? (
        <div className="flex items-center space-x-2">
          <AnimatedDots className="text-slate-500" />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onStop}
            className="h-8 w-8 rounded-full p-0 text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Stop generating"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          onClick={onSend}
          className="h-8 w-8 rounded-full bg-violet-500 p-0 transition-colors duration-200 hover:bg-violet-600 disabled:bg-slate-200 disabled:text-slate-400"
          aria-label="Send message"
          disabled={!canSend}
        >
          <Send className="h-4 w-4 text-white" />
        </Button>
      )}
    </div>
  );
};

export default ChatInput;
