import React from 'react';
import { Send, Loader2, Square, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  useInputMessage, 
  useIsTyping, 
  useWebSocketState, 
  useConversationStore 
} from '@/stores/core/conversationStore';

interface BotChatInputProps {
  className?: string;
}

const BotChatInput: React.FC<BotChatInputProps> = ({
  className = ''
}) => {
  const inputMessage = useInputMessage();
  const isTyping = useIsTyping();
  const websocketState = useWebSocketState();
  const { 
    sendMessage, 
    setInputMessage, 
    activeConversation, 
    currentBotId 
  } = useConversationStore();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping || !websocketState.isConnected) return;
    await sendMessage(inputMessage.trim());
  };

  const handleInputChange = (value: string) => {
    setInputMessage(value);
  };

  const handleStopStreaming = () => {
    // TODO: Implement stop streaming functionality
    console.log('Stop streaming requested');
  };

  const isConnected = websocketState.isConnected;
  const disabled = !activeConversation;
  const placeholder = `Chat with Bot ${currentBotId}...`;
  const getPlaceholder = () => {
    if (!isConnected) return 'Connecting to bot...';
    if (isTyping) return 'Bot is responding...';
    if (disabled) return 'Chat is disabled';
    return placeholder || 'Type your message...';
  };

  const canSend = !disabled && !isTyping && isConnected && inputMessage.trim().length > 0;
  const inputDisabled = disabled || isTyping || !isConnected;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`border-t border-slate-200/60 bg-white/95 backdrop-blur-sm ${className}`}>
      <div className="px-6 py-4">
        {/* Connection Warning */}
        {!isConnected && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800">
              Connection lost. Reconnecting to bot...
            </span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); if (canSend) handleSendMessage(); }} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              disabled={inputDisabled}
              className={`
                w-full rounded-2xl border-slate-200/60 bg-white px-4 py-3 text-base
                transition-all duration-200 placeholder:text-slate-500
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500
                ${!isConnected ? 'border-amber-200 bg-amber-50/50' : ''}
              `}
              autoComplete="off"
              autoFocus
            />
            
            {/* Character counter for long messages */}
            {inputMessage.length > 500 && (
              <div className="absolute -top-6 right-2 text-xs text-slate-400">
                {inputMessage.length}/2000
              </div>
            )}
          </div>

          {/* Send/Stop Button */}
          {isTyping ? (
            <Button
              type="button"
              onClick={handleStopStreaming}
              size="lg"
              variant="outline"
              className="h-12 w-12 rounded-2xl border-red-200 bg-red-50 p-0 text-red-600 hover:bg-red-100 hover:border-red-300"
              aria-label="Stop generating"
            >
              <Square className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!canSend}
              size="lg"
              className={`
                h-12 w-12 rounded-2xl p-0 transition-all duration-200
                ${canSend
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
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
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            {isConnected ? (
              isTyping ? 'AI is thinking...' : 'Press Enter to send, Shift+Enter for new line'
            ) : (
              'Attempting to reconnect...'
            )}
          </span>
          
          {inputMessage.length > 0 && (
            <span className={inputMessage.length > 1500 ? 'text-amber-600' : ''}>
              {inputMessage.length > 0 && `${inputMessage.length} characters`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotChatInput;