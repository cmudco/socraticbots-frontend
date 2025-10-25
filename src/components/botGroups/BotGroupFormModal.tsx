import React from 'react';

import { Info, Users } from 'lucide-react';

import { useIsProfessor } from '@/hooks/queries/useUser';

import { useBotGroupFormStore } from '@/stores/forms/botGroupFormStore';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { BotGroup } from '@/types/botGroup';

import BotGroupBasicInfoTab from './tabs/BotGroupBasicInfoTab';
import BotGroupDeploymentTab from './tabs/BotGroupDeploymentTab';

interface BotGroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  botGroup?: BotGroup | null;
  viewOnly?: boolean;
}

const BotGroupFormModal: React.FC<BotGroupFormModalProps> = ({
  isOpen,
  onClose,
  botGroup,
  viewOnly = false,
}) => {
  const isProfessor = useIsProfessor();
  const { activeTab, setActiveTab, initEditBotGroup, initNewBotGroup, closeForm } =
    useBotGroupFormStore();

  const isEditMode = !!botGroup;

  React.useEffect(() => {
    if (isOpen) {
      if (botGroup) {
        initEditBotGroup(botGroup);
      } else {
        initNewBotGroup();
      }
    }
  }, [isOpen, botGroup, initEditBotGroup, initNewBotGroup]);

  const handleClose = () => {
    closeForm();
    onClose();
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    ...(isEditMode && isProfessor ? [{ id: 'deployment', label: 'Deployment' }] : []),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BotGroupBasicInfoTab botGroupId={botGroup?.id} onClose={handleClose} />;
      case 'deployment':
        return <BotGroupDeploymentTab botGroupId={botGroup?.id || 0} />;
      default:
        return <BotGroupBasicInfoTab botGroupId={botGroup?.id} onClose={handleClose} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Users className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {viewOnly
                  ? 'Bot Group Details'
                  : isEditMode
                    ? 'Edit Bot Group'
                    : 'Create New Bot Group'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {viewOnly
                  ? 'View bot group information below.'
                  : isEditMode
                    ? 'Update the bot group details below.'
                    : 'Create a new group to organize your bots.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!isEditMode && isProfessor && (
          <div className="border-primary/20 bg-primary/5 mx-6 mt-4 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-foreground font-medium">
                  Additional Features Available After Creation
                </p>
                <p className="text-muted-foreground mt-1">
                  Once your bot group is created, you'll be able to generate group-wide deployment
                  codes in the Deployment tab.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          {tabs.length > 1 && (
            <div className="flex-shrink-0 border-b px-6">
              <div className="bg-muted flex rounded-md p-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-background text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">{renderTabContent()}</div>
        </div>

        {viewOnly && (
          <DialogFooter className="flex items-center justify-end space-x-3 border-t p-6">
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BotGroupFormModal;
