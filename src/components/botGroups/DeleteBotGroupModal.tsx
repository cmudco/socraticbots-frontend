import React, { useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

import { useDeleteBotGroup } from '@/hooks/queries/useBotGroups';

import { useErrorStore } from '@/stores/ui/errorStore';

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

interface DeleteBotGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  botGroup: BotGroup;
}

const DeleteBotGroupModal: React.FC<DeleteBotGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  botGroup,
}) => {
  const { addError, clearErrorsByContext, getErrorsByContext } = useErrorStore();

  const deleteBotGroupMutation = useDeleteBotGroup();

  const isDeleting = deleteBotGroupMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      clearErrorsByContext('deleteBotGroup');
    }
  }, [isOpen, clearErrorsByContext]);

  const handleDelete = async () => {
    try {
      clearErrorsByContext('deleteBotGroup');

      await deleteBotGroupMutation.mutateAsync(botGroup.id);

      onClose();
      onSuccess();
    } catch (err) {
      addError('Failed to delete bot group. Please try again.', 'error', 'deleteBotGroup');
      console.error('Error deleting bot group:', err);
    }
  };

  const contextErrors = getErrorsByContext('deleteBotGroup');
  const hasError = contextErrors.length > 0 || deleteBotGroupMutation.isError;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Delete Bot Group</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-slate-600">
            Are you sure you want to delete "<span className="font-semibold">{botGroup.title}</span>
            "? This action cannot be undone and will delete all bots in this group along with their data.
          </DialogDescription>
        </DialogHeader>

        {botGroup.botsCount > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start">
              <svg
                className="mt-0.5 mr-3 h-5 w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800">Warning</h4>
                <p className="mt-1 text-sm text-yellow-700">
                  This group contains {botGroup.botsCount} bot{botGroup.botsCount !== 1 ? 's' : ''}. 
                  All bots and their associated data will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start">
              <svg
                className="mt-0.5 mr-3 h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="mt-1 text-sm text-red-700">
                  {contextErrors[0]?.message ||
                    deleteBotGroupMutation.error?.message ||
                    'An error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </div>
            ) : (
              'Delete Group'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBotGroupModal;