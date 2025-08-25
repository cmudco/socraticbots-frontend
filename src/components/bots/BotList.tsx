import React from 'react';

import { useBots } from '@/hooks/queries/useBots';

import { useModalStore } from '@/stores/ui/modalStore';
import { useUiStore } from '@/stores/ui/uiStore';

import CreateButton from '@/components/widgets/buttons/CreateButton';
import EmptyMessage from '@/components/widgets/states/EmptyMessage';

import { Bot } from '@/types/bot';

import BotFormModal from './BotFormModal';
import BotItem from './BotItem';
import DeleteBotModal from './DeleteBotModal';

interface BotListProps {
  botGroupId: number;
  initialBots: Bot[];
  onBotDeleted?: (botId: number) => void;
}

const BotList: React.FC<BotListProps> = ({ botGroupId, initialBots, onBotDeleted }) => {
  const { data: bots = initialBots || [], isLoading: loading, error } = useBots(botGroupId);

  const {
    botFormModal,
    deleteBotModal,
    openBotFormModal,
    closeBotFormModal,
    openDeleteBotModal,
    closeDeleteBotModal,
  } = useModalStore();

  const { deletedBotIds, addDeletedBot } = useUiStore();

  const handleOpenCreateModal = () => {
    openBotFormModal(botGroupId); // No bot = create mode
  };

  const handleOpenEditModal = (bot: Bot) => {
    openBotFormModal(botGroupId, bot);
  };

  const handleOpenViewModal = (bot: Bot) => {
    openBotFormModal(botGroupId, bot, true);
  };

  const handleDeleteBot = (bot: Bot) => {
    openDeleteBotModal(botGroupId, bot);
  };

  const handleConfirmDelete = (botId: number) => {
    addDeletedBot(botId);
    onBotDeleted?.(botId);
  };

  const visibleBots = bots.filter(bot => !deletedBotIds.has(bot.id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-md text-foreground font-semibold">Bots</h3>
        <CreateButton onClick={handleOpenCreateModal} size="sm" variant="outline">
          Add Bot
        </CreateButton>
      </div>

      {loading ? (
        <p className="text-muted-foreground py-4 text-center">Loading bots...</p>
      ) : error ? (
        <p className="text-destructive py-4 text-center">Error loading bots: {error.message}</p>
      ) : visibleBots.length === 0 ? (
        <EmptyMessage
          professorMessage="No bots yet. Add your first bot!"
          studentMessage="No bots available."
        />
      ) : (
        <div className="space-y-2">
          {visibleBots.map((bot: Bot) => (
            <BotItem
              key={bot.id}
              bot={bot}
              onEdit={() => handleOpenEditModal(bot)}
              onDelete={() => handleDeleteBot(bot)}
              onView={() => handleOpenViewModal(bot)}
            />
          ))}
        </div>
      )}

      <BotFormModal
        isOpen={botFormModal.isOpen}
        onClose={closeBotFormModal}
        bot={botFormModal.bot}
        botGroupId={botFormModal.botGroupId || botGroupId}
        viewOnly={botFormModal.mode === 'view'}
      />

      {deleteBotModal.bot && deleteBotModal.botGroupId && (
        <DeleteBotModal
          isOpen={deleteBotModal.isOpen}
          onClose={closeDeleteBotModal}
          onSuccess={() => handleConfirmDelete(deleteBotModal.bot!.id)}
          bot={deleteBotModal.bot}
          botGroupId={deleteBotModal.botGroupId}
        />
      )}
    </div>
  );
};

export default BotList;
