import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AlertTriangle, Loader2 } from 'lucide-react';

import { useBotAccessStore } from '@/stores/ui/botAccessStore';

import {
  AnonymousConversationsResponse,
  BotAccessUsersResponse,
  botAccessService,
} from '@/services/botAccess.service';
import { botGroupService } from '@/services/botGroups.service';
import { botService } from '@/services/bots.service';

import { formatDate } from '@/utils/formatters';

import RemoveAccessModal from '@/components/bots/RemoveAccessModal';
import UserConversationsSlideOver from '@/components/bots/UserConversationsSlideOver';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Bot as BotType } from '@/types/bot';
import { BotGroupDetail } from '@/types/botGroup';

const BotAccess: React.FC = () => {
  const { botGroupId, botId } = useParams<{ botGroupId: string; botId: string }>();
  const navigate = useNavigate();

  // Local state for data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [botGroups, setBotGroups] = useState<BotGroupDetail[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);
  const [accessData, setAccessData] = useState<BotAccessUsersResponse | null>(null);
  const [anonymousData, setAnonymousData] = useState<AnonymousConversationsResponse | null>(null);
  const [loadingAnonymous, setLoadingAnonymous] = useState(false);

  // Store state for UI
  const {
    activeTab,
    removeAccessModal,
    conversationsSlideOver,
    anonymousConversationView,
    setActiveTab,
    setRemovingUserId,
    closeRemoveAccessModal,
    closeConversationsSlideOver,
    openAnonymousConversationView,
    closeAnonymousConversationView,
    resetStore,
  } = useBotAccessStore();

  // Reset store on mount/unmount
  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  // Fetch bot groups on mount
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

  // Fetch bot access data when bot is selected
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

          // If bot is publicly deployed, fetch anonymous conversations
          if (botData.isPubliclyDeployed) {
            setLoadingAnonymous(true);
            try {
              const anonymousConversations = await botAccessService.getAnonymousConversations(
                parseInt(botGroupId),
                parseInt(botId)
              );
              setAnonymousData(anonymousConversations);
            } catch (anonErr) {
              console.error('Failed to load anonymous conversations:', anonErr);
            } finally {
              setLoadingAnonymous(false);
            }
          }
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

  // Handlers
  const handleConfirmRemoveAccess = async () => {
    if (!botGroupId || !botId) return;

    try {
      setRemovingUserId(removeAccessModal.userId);
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
    resetStore();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-muted-foreground ml-2">Loading...</span>
      </div>
    );
  }

  // Error state
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

  // Bot detail view
  if (selectedBot && accessData) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <BotAccessHeader
          bot={selectedBot}
          accessData={accessData}
          anonymousData={anonymousData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={handleBackToBots}
        />

        {/* Authenticated Users List */}
        {activeTab === 'users' && <AuthenticatedUsersList users={accessData.accessUsers} />}

        {/* Anonymous Conversations List */}
        {activeTab === 'anonymous' && selectedBot.isPubliclyDeployed && anonymousData && (
          <AnonymousConversationsList
            conversations={anonymousData.conversations}
            loading={loadingAnonymous}
            onViewConversation={openAnonymousConversationView}
          />
        )}

        {/* Info Section */}
        <AccessManagementInfo />

        {/* Modals and Slide-overs */}
        <RemoveAccessModal
          isOpen={removeAccessModal.isOpen}
          onClose={closeRemoveAccessModal}
          onSuccess={handleConfirmRemoveAccess}
          userEmail={removeAccessModal.userEmail}
          userName={removeAccessModal.userName}
          accessType={removeAccessModal.accessType}
        />

        <UserConversationsSlideOver
          isOpen={conversationsSlideOver.isOpen}
          onClose={closeConversationsSlideOver}
          botGroupId={parseInt(botGroupId!)}
          botId={parseInt(botId!)}
          user={conversationsSlideOver.user}
        />

        <AnonymousConversationSlideOver
          isOpen={anonymousConversationView.isOpen}
          onClose={closeAnonymousConversationView}
          botGroupId={parseInt(botGroupId!)}
          botId={parseInt(botId!)}
          conversationId={anonymousConversationView.conversationId}
        />
      </div>
    );
  }

  // Bot groups list view
  return <BotGroupsList botGroups={botGroups} onBotSelect={handleBotSelect} />;
};

export default BotAccess;
