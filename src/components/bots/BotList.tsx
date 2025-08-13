import React from 'react';

import { Plus } from 'lucide-react';

import { useBots } from '@/hooks/queries/useBots';

import { useIsProfessor } from '@/hooks/queries/useUser';
import { useModalStore } from '@/stores/ui/modalStore';
import { useUiStore } from '@/stores/ui/uiStore';

import { Bot } from '@/types/bot';

import { Button } from '@/components/ui/button';

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

  const isProfessor = useIsProfessor();

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
        <h3 className="text-md font-semibold">Bots</h3>
        {isProfessor && (
          <Button onClick={handleOpenCreateModal} size="sm" variant="outline">
            <Plus size={14} />
            Add Bot
          </Button>
        )}
      </div>

      {loading ? (
        <p className="py-4 text-center text-gray-500">Loading bots...</p>
      ) : error ? (
        <p className="py-4 text-center text-red-500">Error loading bots: {error.message}</p>
      ) : visibleBots.length === 0 ? (
        <p className="py-4 text-center text-gray-500">
          {isProfessor ? 'No bots yet. Add your first bot!' : 'No bots available.'}
        </p>
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