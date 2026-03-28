import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Globe, Loader2, MessageSquare } from 'lucide-react';

import {
  ConversationMessage,
  ConversationMessagesResponse,
  botAccessService,
} from '@/services/botAccess.service';

import MessageBubble from '@/components/bots/MessageBubble';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface AnonymousConversationSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  botGroupId: number;
  botId: number;
  conversationId: string | null;
}

const AnonymousConversationSlideOver: React.FC<AnonymousConversationSlideOverProps> = ({
  isOpen,
  onClose,
  botGroupId,
  botId,
  conversationId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState<ConversationMessagesResponse | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch the messages for this conversation
      const messagesData = await botAccessService.getConversationMessages(
        botGroupId,
        botId,
        conversationId
      );
      setConversationData(messagesData);

      // Scroll to bottom after messages load
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [botGroupId, botId, conversationId]);

  // Fetch conversation when panel opens
  useEffect(() => {
    if (isOpen && conversationId) {
      setConversationData(null);
      fetchConversation();
    }
  }, [isOpen, conversationId, fetchConversation]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
      >
        {/* Header with anonymous session info */}
        <SheetHeader className="border-border bg-muted/30 dark:bg-muted/10 border-b px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Anonymous Avatar */}
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/20">
                <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">Anonymous User</SheetTitle>
              <SheetDescription className="truncate">Public bot conversation</SheetDescription>

              {/* Access info badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-100 text-xs text-green-800 dark:border-green-700 dark:bg-green-900/50 dark:text-green-200"
                >
                  <Globe className="mr-1 h-3 w-3" />
                  Anonymous Session
                </Badge>
                {conversationId && (
                  <Badge
                    variant="outline"
                    className="bg-muted/50 dark:bg-muted/30 font-mono text-xs"
                  >
                    ID: {conversationId.substring(0, 12)}...
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Conversation title bar */}
        {conversationData && (
          <div className="border-border bg-background flex items-center gap-3 border-b px-4 py-3">
            <MessageSquare className="text-muted-foreground h-4 w-4" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {conversationData.title || 'Anonymous Conversation'}
              </p>
              <p className="text-muted-foreground text-xs">
                {conversationData.totalCount || 0} messages
              </p>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
              <span className="text-muted-foreground ml-2">Loading conversation...</span>
            </div>
          )}

          {error && (
            <div className="flex h-full flex-col items-center justify-center p-4">
              <p className="text-destructive mb-3 text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchConversation}>
                Try again
              </Button>
            </div>
          )}

          {!loading && !error && !conversationData && (
            <div className="flex h-full flex-col items-center justify-center p-4">
              <MessageSquare className="text-muted-foreground/40 mb-3 h-12 w-12" />
              <p className="text-muted-foreground text-center text-sm">No conversation found.</p>
            </div>
          )}

          {!loading && !error && conversationData && (
            <ScrollArea className="h-full">
              <div className="space-y-4 px-4 py-4">
                {conversationData.messages.length > 0 ? (
                  conversationData.messages.map((msg: ConversationMessage) => (
                    <MessageBubble key={msg.messageId} message={msg} />
                  ))
                ) : (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No messages in this conversation.
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AnonymousConversationSlideOver;
