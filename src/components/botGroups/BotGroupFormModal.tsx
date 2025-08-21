import React, { useCallback, useEffect } from 'react';

import { Users } from 'lucide-react';

import { useCreateBotGroup, useUpdateBotGroup } from '@/hooks/queries/useBotGroups';

import { BotGroup } from '@/types/botGroup';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createBotGroupMutation = useCreateBotGroup();
  const updateBotGroupMutation = useUpdateBotGroup();

  const isEdit = !!botGroup;

  useEffect(() => {
    if (isOpen) {
      if (botGroup) {
        setTitle(botGroup.title || '');
        setDescription(botGroup.description || '');
      } else {
        setTitle('');
        setDescription('');
      }
    }
  }, [isOpen, botGroup]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setTitle('');
      setDescription('');
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const botGroupData = {
        title: title.trim(),
        description: description.trim(),
      };

      if (isEdit && botGroup) {
        await updateBotGroupMutation.mutateAsync({
          id: botGroup.id,
          botGroupData,
        });
      } else {
        await createBotGroupMutation.mutateAsync(botGroupData);
      }

      handleClose();
    } catch (error) {
      console.error('Error saving bot group:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title,
    description,
    isEdit,
    botGroup,
    updateBotGroupMutation,
    createBotGroupMutation,
    handleClose,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {viewOnly ? 'Bot Group Details' : isEdit ? 'Edit Bot Group' : 'Create New Bot Group'}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {viewOnly
                  ? 'View bot group information below.'
                  : isEdit
                    ? 'Update the bot group details below.'
                    : 'Create a new group to organize your bots.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Group Title *
            </label>
            <input
              id="title"
              type="text"
              disabled={viewOnly}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter bot group title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              disabled={viewOnly}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:ring-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={3}
              placeholder="Describe the purpose of this bot group..."
            />
          </div>

          {botGroup && (
            <div className="text-sm text-gray-500">
              <p>Bots: {botGroup.botsCount}</p>
              <p>Created: {new Date(botGroup.createdAt).toLocaleDateString()}</p>
              {botGroup.collaborators && botGroup.collaborators.length > 0 && (
                <p>Collaborators: {botGroup.collaborators.length}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end space-x-3">
          {viewOnly ? (
            <Button onClick={handleClose} className="bg-violet-600 text-white hover:bg-violet-700">
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim()}
                className="bg-violet-600 text-white hover:bg-violet-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </div>
                ) : isEdit ? (
                  'Update Group'
                ) : (
                  'Create Group'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BotGroupFormModal;