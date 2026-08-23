import React from 'react';

import { Clock, Globe, Loader2, MessagesSquare } from 'lucide-react';

import { AnonymousConversation } from '@/services/botAccess.service';

import { formatDate } from '@/utils/formatters';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnonymousConversationsListProps {
  conversations: AnonymousConversation[];
  loading: boolean;
  onViewConversation: (conversationId: string) => void;
}

const AnonymousConversationsList: React.FC<AnonymousConversationsListProps> = ({
  conversations,
  loading,
  onViewConversation,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Anonymous Conversations</CardTitle>
        <p className="text-muted-foreground">
          View conversations from anonymous users of this public bot
        </p>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <span className="text-muted-foreground ml-2">Loading anonymous conversations...</span>
          </div>
        ) : conversations.length > 0 ? (
          <div className="divide-border dark:divide-border/50 divide-y">
            {conversations.map(conversation => (
              <div
                key={conversation.conversationId}
                className="hover:bg-accent/50 dark:hover:bg-accent/20 px-6 py-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/20">
                        <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="truncate text-sm font-medium">
                          {conversation.title ||
                            `Anonymous Session ${conversation.sessionId.substring(0, 8)}`}
                        </p>
                        <Badge
                          variant="secondary"
                          className="border-green-200 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/50 dark:text-green-200"
                        >
                          Anonymous
                        </Badge>
                      </div>

                      <div className="mt-1 flex items-center space-x-4">
                        <div className="text-muted-foreground flex items-center space-x-1 text-xs">
                          <MessagesSquare className="h-3 w-3" />
                          <span>{conversation.messageCount} messages</span>
                        </div>

                        <div className="text-muted-foreground flex items-center space-x-1 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>Started: {formatDate(conversation.createdAt)}</span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-muted-foreground/20 bg-muted/50 font-mono text-xs"
                        >
                          Session: {conversation.sessionId.substring(0, 16)}...
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewConversation(conversation.conversationId)}
                      className="text-xs"
                    >
                      <MessagesSquare className="mr-1.5 h-3.5 w-3.5" />
                      View Messages
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Globe className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No anonymous conversations yet</h3>
            <p className="text-muted-foreground">
              Anonymous users who chat with this public bot will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnonymousConversationsList;
