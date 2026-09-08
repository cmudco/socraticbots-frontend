import React, { useEffect, useRef } from 'react';

import { Loader2, Send, Square } from 'lucide-react';

import {
  usePublicBotStore,
  usePublicInputMessage,
  usePublicIsTyping,
} from '@/stores/core/publicBotStore';
import {
  useIsPublicWebSocketConnected,
  usePublicWebSocketStore,
} from '@/stores/core/publicWebSocketStore';

import QuickPromptPills from '@/components/chat/QuickPromptPills';
import { Button } from '@/components/ui/button';

interface PublicChatInputProps {
  onSendMessage: (message: string) => void;
  roundedClass?: string;
}

const PublicChatInput: React.FC<PublicChatInputProps> = ({
  onSendMessage,
  roundedClass = 'rounded-2xl',
}) => {
  const inputMessage = usePublicInputMessage();
  const { stopResponse, isStopping } = usePublicWebSocketStore();
  const isTyping = usePublicIsTyping();
  const isWebSocketConnected = useIsPublicWebSocketConnected();
  const { setInputMessage, activeConversation, botInfo } = usePublicBotStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping || !isWebSocketConnected) return;
    onSendMessage(inputMessage.trim());
    setInputMessage(''); // Clear input after sending
  };

  const handleInputChange = (value: string) => {
    setInputMessage(value);
  };

  const isConnected = isWebSocketConnected;
  const disabled = !activeConversation;
  const placeholder = botInfo?.title ? `Chat with ${botInfo.title}...` : '';

  const getPlaceholder = () => {
    if (!isConnected) return 'Connecting to bot...';
    if (isTyping) return 'Bot is responding...';
    if (disabled) return 'Chat is disabled';
    return placeholder || 'Type your message...';
  };

  const canSend = !disabled && !isTyping && isConnected && inputMessage.trim().length > 0;
  const inputDisabled = disabled || isTyping || !isConnected;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [inputMessage]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && inputMessage === '' && !isTyping && isConnected && !disabled) {
      const timeoutId = setTimeout(() => {
        textarea.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [inputMessage, isTyping, isConnected, disabled]);

  return (
    <div className="border-border/60 bg-background/95 border-t backdrop-blur-sm">
      <div className="px-6 py-4">
        {/* Quick Prompt Pills */}
        {botInfo?.quickPrompts && botInfo.quickPrompts.length > 0 && (
          <QuickPromptPills
            quickPrompts={botInfo.quickPrompts}
            onPromptClick={promptText => setInputMessage(promptText)}
            disabled={inputDisabled}
          />
        )}

        {/* Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            if (canSend) handleSendMessage();
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              disabled={inputDisabled}
              className={`border-border/60 bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 disabled:bg-muted disabled:text-muted-foreground w-full resize-none overflow-y-auto px-4 py-3 text-base transition-all duration-200 focus:ring-2 disabled:cursor-not-allowed ${roundedClass} ${!isConnected ? 'border-destructive/20 bg-destructive/5' : ''}`}
              style={{ minHeight: '3rem', maxHeight: '10rem' }}
              rows={1}
              autoComplete="off"
              autoFocus
            />

            {/* Character counter for long messages */}
            {inputMessage.length > 500 && (
              <div className="text-muted-foreground absolute -top-6 right-2 text-xs">
                {inputMessage.length}/2000
              </div>
            )}
          </div>

          {/* Send or stop the active DARE generation. */}
          {isTyping ? (
            <Button
              type="button"
              onClick={stopResponse}
              disabled={isStopping || !isConnected}
              aria-label={isStopping ? 'Stopping response' : 'Stop generating'}
              variant="outline"
              size="lg"
              className={`h-12 w-12 p-0 ${roundedClass}`}
            >
              {isStopping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!canSend}
              size="lg"
              className={`h-12 w-12 p-0 transition-all duration-200 ${roundedClass} ${
                canSend
                  ? 'from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r shadow-md hover:shadow-lg'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              } `}
              aria-label="Send message"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          )}
        </form>

        {/* Helper Text */}
        <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
          <span>
            {isConnected
              ? isTyping
                ? 'AI is thinking...'
                : 'Press Enter to send, Shift+Enter for new line'
              : 'Attempting to reconnect...'}
          </span>

          {inputMessage.length > 0 && (
            <span className={inputMessage.length > 1500 ? 'text-destructive' : ''}>
              {inputMessage.length > 0 && `${inputMessage.length} characters`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicChatInput;
