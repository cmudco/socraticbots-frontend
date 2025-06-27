import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Square } from 'lucide-react';
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
        if (isStreaming) return "AI is responding...";
        if (disabled) return "Please select a chapter first";
        return "Ask me anything about this chapter...";
    };

    const canSend = !disabled && !isStreaming && value.trim().length > 0;

    return (
        <div className="flex items-center gap-3 w-full bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-200/60 hover:border-slate-300/60 focus-within:border-violet-400 focus-within:shadow-md transition-all duration-200">
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
                className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-slate-500 disabled:cursor-not-allowed"
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
                        className="h-8 w-8 p-0 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                        aria-label="Stop generating"
                    >
                        <Square className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    size="sm"
                    onClick={onSend}
                    className="h-8 w-8 p-0 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-200 disabled:text-slate-400 rounded-full transition-colors duration-200"
                    aria-label="Send message"
                    disabled={!canSend}
                >
                    <Send className="w-4 h-4 text-white" />
                </Button>
            )}
        </div>
    );
};

export default ChatInput;