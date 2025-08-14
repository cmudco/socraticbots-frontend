import React from 'react';
import { Bot, Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWebSocketState, useConversationStore } from '@/stores/core/conversationStore';

interface BotChatHeaderProps {
  className?: string;
}

const ConnectionStatus: React.FC = () => {
  const websocketState = useWebSocketState();
  if (websocketState.isConnecting) {
    return (
      <div className="flex items-center gap-2 text-yellow-600 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (websocketState.error) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>Connection error</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${websocketState.isConnected ? 'text-green-600' : 'text-gray-500'}`}>
      {websocketState.isConnected ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <span>{websocketState.isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
};

const BotChatHeader: React.FC<BotChatHeaderProps> = ({ 
  className = ''
}) => {
  const { currentBotId } = useConversationStore();
  const websocketState = useWebSocketState();
  
  if (!currentBotId) return null;
  
  const botName = `Bot ${currentBotId}`;

  return (
    <header className={`sticky top-0 z-10 w-full border-b border-slate-200/60 bg-gradient-to-r from-white via-slate-50/90 to-white shadow-sm backdrop-blur-sm ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-slate-800">{botName}</span>
                  {websocketState.isConnected ? (
                    <Badge
                      variant="secondary"
                      className="border-green-200 bg-green-50 text-green-700"
                    >
                      <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-400"></div>
                      Online
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-300 bg-slate-50 text-slate-600"
                    >
                      Offline
                    </Badge>
                  )}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Bot ID: {currentBotId}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ConnectionStatus />
          </div>
        </div>

        {websocketState.isConnected && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
              <span className="text-slate-600">Ready to chat</span>
            </div>
            <div className="text-xs text-slate-500">AI assistant ready • DARE backend connected</div>
          </div>
        )}

        {websocketState.error && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 px-3 py-2">
            <div className="flex items-center space-x-2 text-sm">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">Connection Error</span>
            </div>
            <div className="text-xs text-red-600">{websocketState.error}</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default BotChatHeader;