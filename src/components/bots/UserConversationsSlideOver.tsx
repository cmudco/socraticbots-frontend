import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Clock, Key, Loader2, MessageSquare } from 'lucide-react';

import {
  ConversationMessage,
  ConversationMessagesResponse,
  UserConversationsResponse,
  botAccessService,
} from '@/services/botAccess.service';

import { formatDate, getAccessTypeLabel } from '@/utils/formatters';

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

import { UserAccessInfo } from '@/types/botAccess';

interface UserConversationsSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  botGroupId: number;
  botId: number;
  user: UserAccessInfo | null;
}

const UserConversationsSlideOver: React.FC<UserConversationsSlideOverProps> = ({
  isOpen,
  onClose,
  botGroupId,
  botId,
  user,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState<ConversationMessagesResponse | null>(
    null
  );
  const [conversationMeta, setConversationMeta] = useState<{
    title: string | null;
    createdAt: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userName = user
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email
    : '';

  const fetchConversation = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // First get the user's conversation list (should have only 1)
      const conversationsResponse: UserConversationsResponse =
        await botAccessService.getUserConversations(botGroupId, botId, user.userId);

      if (conversationsResponse.conversations.length === 0) {
        // No conversation exists yet
        setConversationData(null);
        setConversationMeta(null);
        setLoading(false);
        return;
      }

      // Get the single conversation (first one)
      const conversation = conversationsResponse.conversations[0];
      setConversationMeta({
        title: conversation.title,
        createdAt: conversation.createdAt,
      });

      // Fetch the messages for this conversation
      const messagesData = await botAccessService.getConversationMessages(
        botGroupId,
        botId,
        conversation.conversationId
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
  }, [botGroupId, botId, user]);

  // Fetch conversation when panel opens
  useEffect(() => {
    if (isOpen && user) {
      setConversationData(null);
      setConversationMeta(null);
      fetchConversation();
    }
  }, [isOpen, user, fetchConversation]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
      >
        {/* Header with user info */}
        <SheetHeader className="border-border bg-muted/30 dark:bg-muted/10 border-b px-6 py-4">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              <div className="bg-primary/10 dark:bg-primary/20 border-border flex h-12 w-12 items-center justify-center rounded-full border">
                <span className="text-primary text-lg font-semibold">
                  {user?.firstName?.[0] || user?.email[0].toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{userName}</SheetTitle>
              <SheetDescription className="truncate">{user?.email}</SheetDescription>

              {/* Access info badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-muted/50 dark:bg-muted/30 text-xs">
                  <Key className="mr-1 h-3 w-3" />
                  {getAccessTypeLabel(user?.accessType || '')}
                </Badge>
                <Badge variant="outline" className="bg-muted/50 dark:bg-muted/30 text-xs">
                  Code: {user?.accessCode}
                </Badge>
                {user?.isCreator && (
                  <Badge className="border-purple-200 bg-purple-100 text-xs text-purple-800 dark:border-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                    Creator
                  </Badge>
                )}
              </div>

              {user?.accessGrantedAt && (
                <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>Access granted: {formatDate(user.accessGrantedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Conversation title bar */}
        {conversationMeta && (
          <div className="border-border bg-background flex items-center gap-3 border-b px-4 py-3">
            <MessageSquare className="text-muted-foreground h-4 w-4" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {conversationMeta.title || 'Conversation'}
              </p>
              <p className="text-muted-foreground text-xs">
                {conversationData?.totalCount || 0} messages
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
              <p className="text-muted-foreground text-center text-sm">No conversation yet.</p>
              <p className="text-muted-foreground/70 mt-1 text-center text-xs">
                This user hasn't started chatting with this bot.
              </p>
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

export default UserConversationsSlideOver;
