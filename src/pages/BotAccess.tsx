import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle,
  ChevronRight,
  Clock,
  Key,
  Loader2,
  UserX,
  Users,
} from 'lucide-react';

import { BotAccessUsersResponse, botAccessService } from '@/services/botAccess.service';
import { botGroupService } from '@/services/botGroups.service';
import { botService } from '@/services/bots.service';

import RemoveAccessModal from '@/components/bots/RemoveAccessModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Bot as BotType } from '@/types/bot';
import { BotGroupDetail } from '@/types/botGroup';

const BotAccess: React.FC = () => {
  const { botGroupId, botId } = useParams<{ botGroupId: string; botId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [botGroups, setBotGroups] = useState<BotGroupDetail[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);
  const [accessData, setAccessData] = useState<BotAccessUsersResponse | null>(null);
  const [removingUser, setRemovingUser] = useState<number | null>(null);

  const [removeAccessModal, setRemoveAccessModal] = useState<{
    isOpen: boolean;
    userId: number;
    userEmail: string;
    userName: string;
    accessType: string;
  }>({
    isOpen: false,
    userId: 0,
    userEmail: '',
    userName: '',
    accessType: '',
  });

  useEffect(() => {
    const fetchBotGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const groups = await botGroupService.getBotGroups({ ownedOnly: true });
        setBotGroups(groups);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load bot groups';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBotGroups();
  }, []);

  useEffect(() => {
    if (botGroupId && botId) {
      const fetchBotAccessData = async () => {
        try {
          setLoading(true);
          setError(null);

          const botData = await botService.getBot(parseInt(botGroupId), parseInt(botId));
          setSelectedBot(botData);

          const accessUsersData = await botAccessService.getBotAccessUsers(
            parseInt(botGroupId),
            parseInt(botId)
          );
          setAccessData(accessUsersData);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load bot access data';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      fetchBotAccessData();
    }
  }, [botGroupId, botId]);

  const handleRemoveUserAccess = (
    userId: number,
    userEmail: string,
    userName: string,
    accessType: string
  ) => {
    setRemoveAccessModal({
      isOpen: true,
      userId,
      userEmail,
      userName,
      accessType,
    });
  };

  const handleConfirmRemoveAccess = async () => {
    if (!botGroupId || !botId) return;

    try {
      setRemovingUser(removeAccessModal.userId);
      await botAccessService.removeUserBotAccess(
        parseInt(botGroupId),
        parseInt(botId),
        removeAccessModal.userId
      );

      const updatedAccessData = await botAccessService.getBotAccessUsers(
        parseInt(botGroupId),
        parseInt(botId)
      );
      setAccessData(updatedAccessData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user access';
      setError(errorMessage);
    } finally {
      setRemovingUser(null);
    }
  };

  const closeRemoveAccessModal = () => {
    setRemoveAccessModal({
      isOpen: false,
      userId: 0,
      userEmail: '',
      userName: '',
      accessType: '',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAccessTypeLabel = (accessType: string) => {
    switch (accessType) {
      case 'direct_bot':
        return 'Direct Bot Access';
      case 'bot_group':
        return 'Bot Group Access';
      case 'bot_group_owner':
        return 'Bot Group Owner';
      case 'bot_group_collaborator':
        return 'Bot Group Collaborator';
      case 'bot_creator':
        return 'Bot Creator';
      default:
        return accessType;
    }
  };

  const getAccessTypeIcon = (accessType: string) => {
    switch (accessType) {
      case 'direct_bot':
        return <Key className="h-4 w-4" />;
      case 'bot_group':
        return <Users className="h-4 w-4" />;
      case 'bot_group_owner':
        return <Users className="h-4 w-4" />;
      case 'bot_group_collaborator':
        return <Users className="h-4 w-4" />;
      case 'bot_creator':
        return <Bot className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  const handleBotSelect = (botGroupId: number, botId: number) => {
    navigate(`/bot-access/${botGroupId}/${botId}`);
  };

  const handleBackToBots = () => {
    navigate('/bot-access');
    setSelectedBot(null);
    setAccessData(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-muted-foreground ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-2 text-xl font-semibold">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedBot && accessData) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBackToBots} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bots
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Bot Access Management</h1>
              <div className="text-muted-foreground">
                <p className="text-lg">
                  <span className="font-semibold">{selectedBot.title}</span>
                </p>
                <p className="text-sm">
                  {selectedBot.botGroup.title} • {selectedBot.subject} • {selectedBot.topic}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-primary text-2xl font-bold">{accessData.totalCount}</div>
              <div className="text-muted-foreground text-sm">Total Users</div>
            </div>
          </div>
        </div>

        {/* Access Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Users with Access</CardTitle>
            <p className="text-muted-foreground">Manage who has access to this bot</p>
          </CardHeader>

          <CardContent className="p-0">
            {accessData.accessUsers && accessData.accessUsers.length > 0 ? (
              <div className="divide-border dark:divide-border/50 divide-y">
                {accessData.accessUsers.map(user => (
                  <div
                    key={user.userId}
                    className="hover:bg-accent/50 dark:hover:bg-accent/20 px-6 py-4 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="bg-primary/10 dark:bg-primary/20 border-border flex h-10 w-10 items-center justify-center rounded-full border">
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

                          <div className="mt-1">
                            <Badge
                              variant="outline"
                              className="bg-muted/50 border-muted-foreground/20 text-xs"
                            >
                              Code: {user.accessCode}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {user.accessType === 'bot_group_owner' ||
                        user.accessType === 'bot_creator' ? (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground border-muted-foreground/20 text-xs"
                          >
                            Cannot Remove
                          </Badge>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleRemoveUserAccess(
                                user.userId,
                                user.email,
                                `${user.firstName} ${user.lastName}`.trim() || user.email,
                                user.accessType
                              )
                            }
                            disabled={removingUser === user.userId}
                          >
                            {removingUser === user.userId ? (
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

        {/* Info Section */}
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="text-primary mt-0.5 h-5 w-5" />
              <div>
                <h3 className="text-primary text-sm font-medium">Access Management Information</h3>
                <div className="text-muted-foreground mt-2 space-y-1 text-sm">
                  <p>
                    • <strong>Direct Bot Access:</strong> Users who redeemed a specific subscription
                    code for this bot
                  </p>
                  <p>
                    • <strong>Bot Group Access:</strong> Users who redeemed a subscription code for
                    the entire bot group
                  </p>
                  <p>
                    • <strong>Bot Group Owner:</strong> The creator of the bot group (has access to
                    all bots)
                  </p>
                  <p>
                    • <strong>Bot Group Collaborator:</strong> Users invited to collaborate on the
                    bot group
                  </p>
                  <p>
                    • <strong>Bot Creator:</strong> The user who created this specific bot
                  </p>
                  <p>• Removing access will prevent the user from accessing this bot</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remove Access Modal */}
        <RemoveAccessModal
          isOpen={removeAccessModal.isOpen}
          onClose={closeRemoveAccessModal}
          onSuccess={handleConfirmRemoveAccess}
          userEmail={removeAccessModal.userEmail}
          userName={removeAccessModal.userName}
          accessType={removeAccessModal.accessType}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Bot Access Management</h1>
        <p className="text-muted-foreground">Select a bot to manage user access and permissions</p>
      </div>

      {botGroups.length > 0 ? (
        <div className="space-y-6">
          {botGroups.map(group => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="text-xl">{group.title}</CardTitle>
                {group.description && <p className="text-muted-foreground">{group.description}</p>}
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-border dark:divide-border/50 divide-y">
                  {group.bots && group.bots.length > 0 ? (
                    group.bots.map((bot: BotType) => (
                      <div
                        key={bot.id}
                        className="hover:bg-accent/50 dark:hover:bg-accent/20 cursor-pointer px-6 py-4 transition-colors"
                        onClick={() => handleBotSelect(group.id, bot.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bot className="text-primary h-5 w-5" />
                            <div>
                              <h3 className="text-sm font-medium">{bot.title}</h3>
                              <p className="text-muted-foreground text-xs">
                                {bot.subject} • {bot.topic}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="text-muted-foreground h-5 w-5" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground px-6 py-4 text-center">
                      No bots in this group
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No bot groups found</h3>
            <p className="text-muted-foreground">
              Create bot groups and bots to start managing access.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BotAccess;
