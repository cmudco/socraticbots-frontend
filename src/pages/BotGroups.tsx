import React from 'react';

import { useBotGroups } from '@/hooks/queries/useBotGroups';

import { useModalStore } from '@/stores/ui/modalStore';

import BotGroupFormModal from '@/components/botGroups/BotGroupFormModal';
import BotGroupTable from '@/components/botGroups/BotGroupTable';
import DeleteBotGroupModal from '@/components/botGroups/DeleteBotGroupModal';
import CreateButton from '@/components/widgets/buttons/CreateButton';
import EmptyStateCard from '@/components/widgets/states/EmptyStateCard';

import { BotGroup } from '@/types/botGroup';

const BotGroups: React.FC = () => {
  const { data: botGroups = [], isLoading: loading, error, isError } = useBotGroups();

  const {
    botGroupFormModal,
    deleteBotGroupModal,
    openBotGroupFormModal,
    closeBotGroupFormModal,
    openDeleteBotGroupModal,
    closeDeleteBotGroupModal,
  } = useModalStore();

  const handleOpenCreateModal = () => {
    openBotGroupFormModal(); // No botGroup = create mode
  };

  const handleOpenEditModal = (botGroup: BotGroup) => {
    openBotGroupFormModal(botGroup);
  };

  const handleOpenViewModal = (botGroup: BotGroup) => {
    openBotGroupFormModal(botGroup, true);
  };

  const handleOpenDeleteModal = (botGroup: BotGroup) => {
    openDeleteBotGroupModal(botGroup);
  };

  const handleBotGroupSuccess = () => {};

  const renderContent = () => {
    if (loading) {
      return <div className="text-muted-foreground p-4 text-center">Loading chatbot groups...</div>;
    }

    if (isError) {
      return (
        <div className="text-destructive p-4 text-center">
          {error?.message || 'Could not load chatbot groups. Please try again later.'}
        </div>
      );
    }

    if (botGroups.length === 0) {
      return (
        <EmptyStateCard
          creatorTitle="No Chatbot Groups"
          creatorMessage="Create your first chatbot group to get started."
          studentTitle="No Chatbot Groups Available"
          studentMessage="You don't have access to any chatbot groups yet. Please contact your instructor for a subscription code."
          actionText="Create New Chatbot Group"
          onAction={handleOpenCreateModal}
        />
      );
    }

    return (
      <BotGroupTable
        botGroups={botGroups}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onView={handleOpenViewModal}
      />
    );
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chatbot groups</h1>
        <CreateButton
          onClick={handleOpenCreateModal}
          className="bg-primary text-primary-foreground hover:bg-primary/80"
        >
          Create New Chatbot Group
        </CreateButton>
      </div>

      {renderContent()}

      <BotGroupFormModal
        isOpen={botGroupFormModal.isOpen}
        onClose={closeBotGroupFormModal}
        botGroup={botGroupFormModal.botGroup || undefined}
        viewOnly={botGroupFormModal.mode === 'view'}
      />

      {deleteBotGroupModal.botGroup && (
        <DeleteBotGroupModal
          isOpen={deleteBotGroupModal.isOpen}
          onClose={closeDeleteBotGroupModal}
          onSuccess={handleBotGroupSuccess}
          botGroup={deleteBotGroupModal.botGroup}
        />
      )}
    </div>
  );
};

export default BotGroups;
