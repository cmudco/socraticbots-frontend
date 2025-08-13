import React from 'react';

import { Plus } from 'lucide-react';

import { useBotGroups } from '@/hooks/queries/useBotGroups';
import { useAuth } from '@/hooks/useAuth';

import { useModalStore } from '@/stores/ui/modalStore';

import BotGroupFormModal from '@/components/botGroups/BotGroupFormModal';
import BotGroupTable from '@/components/botGroups/BotGroupTable';
import DeleteBotGroupModal from '@/components/botGroups/DeleteBotGroupModal';
import { Button } from '@/components/ui/button';

import { BotGroup } from '@/types/botGroup';

const BotGroups: React.FC = () => {
  const { data: botGroups = [], isLoading: loading, error, isError } = useBotGroups();

  const { user } = useAuth();

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
      return <div className="p-4 text-center">Loading chatbot groups...</div>;
    }

    if (isError) {
      return (
        <div className="p-4 text-center text-red-500">
          {error?.message || 'Could not load chatbot groups. Please try again later.'}
        </div>
      );
    }

    if (botGroups.length === 0) {
      if (user?.isProfessor) {
        return (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600">No Chatbot Groups</h3>
            <p className="mt-1 text-gray-500">
              Create your first chatbot group to get started.
            </p>
            <Button
              onClick={handleOpenCreateModal}
              className="mt-4 bg-violet-600 text-white hover:bg-violet-700"
            >
              <Plus size={16} />
              Create New Chatbot Group
            </Button>
          </div>
        );
      } else {
        return (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600">No Chatbot Groups Available</h3>
            <p className="mt-1 text-gray-500">
              You don't have access to any chatbot groups yet. Please contact your instructor for an
              access code.
            </p>
          </div>
        );
      }
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
        {/* Only show Create New Chatbot Group button for professors */}
        {user?.isProfessor && (
          <Button
            onClick={handleOpenCreateModal}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            <Plus size={16} />
            Create New Chatbot Group
          </Button>
        )}
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