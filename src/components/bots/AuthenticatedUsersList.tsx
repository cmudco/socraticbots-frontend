import React from 'react';

import { Clock, Key, Loader2, MessagesSquare, UserX, Users } from 'lucide-react';

import { useBotAccessStore } from '@/stores/ui/botAccessStore';

import { BotAccessUser } from '@/services/botAccess.service';

import { formatDate, getAccessTypeLabel } from '@/utils/formatters';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthenticatedUsersListProps {
  users: BotAccessUser[];
}

const AuthenticatedUsersList: React.FC<AuthenticatedUsersListProps> = ({ users }) => {
  const { removingUserId, openConversationsSlideOver, openRemoveAccessModal } = useBotAccessStore();

  const getAccessTypeIcon = (accessType: string) => {
    switch (accessType) {
      case 'direct_bot':
        return <Key className="h-4 w-4" />;
      case 'bot_group':
      case 'bot_group_owner':
      case 'bot_group_collaborator':
        return <Users className="h-4 w-4" />;
      case 'bot_creator':
        return <Users className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Users with Access</CardTitle>
        <p className="text-muted-foreground">Manage who has access to this bot</p>
      </CardHeader>

      <CardContent className="p-0">
        {users.length > 0 ? (
          <div className="divide-border dark:divide-border/50 divide-y">
            {users.map(user => (
              <div
                key={user.userId}
                className="hover:bg-accent/50 dark:hover:bg-accent/20 px-6 py-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="border-border bg-primary/10 dark:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full border">
                        <span className="text-primary font-semibold">
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="truncate text-sm font-medium">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email}
                        </p>
                        {user.isCreator && (
                          <Badge
                            variant="secondary"
                            className="border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
                          >
                            Creator
                          </Badge>
                        )}
                      </div>

                      <div className="mt-1 flex items-center space-x-4">
                        <p className="text-muted-foreground text-sm">{user.email}</p>

                        <div className="text-muted-foreground flex items-center space-x-1 text-xs">
                          {getAccessTypeIcon(user.accessType)}
                          <span>{getAccessTypeLabel(user.accessType)}</span>
                        </div>

                        <div className="text-muted-foreground flex items-center space-x-1 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>Access granted: {formatDate(user.accessGrantedAt)}</span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-muted-foreground/20 bg-muted/50 text-xs"
                        >
                          Code: {user.accessCode}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openConversationsSlideOver({
                          userId: user.userId,
                          email: user.email,
                          firstName: user.firstName,
                          lastName: user.lastName,
                          accessType: user.accessType,
                          accessCode: user.accessCode,
                          accessGrantedAt: user.accessGrantedAt,
                          isCreator: user.isCreator,
                        })
                      }
                      className="text-xs"
                    >
                      <MessagesSquare className="mr-1.5 h-3.5 w-3.5" />
                      Conversation
                    </Button>
                    {user.accessType === 'bot_group_owner' || user.accessType === 'bot_creator' ? (
                      <Badge
                        variant="outline"
                        className="border-muted-foreground/20 text-muted-foreground text-xs"
                      >
                        Cannot Remove
                      </Badge>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          openRemoveAccessModal(
                            user.userId,
                            user.email,
                            `${user.firstName} ${user.lastName}`.trim() || user.email,
                            user.accessType
                          )
                        }
                        disabled={removingUserId === user.userId}
                      >
                        {removingUserId === user.userId ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="mr-1 h-4 w-4" />
                        )}
                        Remove Access
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No users have access yet</h3>
            <p className="text-muted-foreground">
              Users will appear here once they redeem a subscription code for this bot.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthenticatedUsersList;
