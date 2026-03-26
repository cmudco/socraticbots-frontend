import React, { useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

import { useDeleteBot } from '@/hooks/queries/useBots';

import { useErrorStore } from '@/stores/ui/errorStore';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Bot } from '@/types/bot';

interface DeleteBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bot: Bot;
  botGroupId: number;
}

const DeleteBotModal: React.FC<DeleteBotModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bot,
  botGroupId,
}) => {
  const { addError, clearErrorsByContext, getErrorsByContext } = useErrorStore();

  const deleteBotMutation = useDeleteBot();

  const isDeleting = deleteBotMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      clearErrorsByContext('deleteBot');
    }
  }, [isOpen, clearErrorsByContext]);

  const handleDelete = async () => {
    try {
      clearErrorsByContext('deleteBot');

      await deleteBotMutation.mutateAsync({ botGroupId, botId: bot.id });

      onClose();
      onSuccess();
    } catch (err) {
      addError('Failed to delete bot. Please try again.', 'error', 'deleteBot');
      console.error('Error deleting bot:', err);
    }
  };

  const contextErrors = getErrorsByContext('deleteBot');
  const hasError = contextErrors.length > 0 || deleteBotMutation.isError;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-semibold">Delete Bot</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground pt-2">
            Are you sure you want to delete "<span className="font-semibold">{bot.title}</span>
            "? This action cannot be undone and all associated data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        {hasError && (
          <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-4">
            <div className="flex items-start">
              <svg
                className="text-destructive mt-0.5 mr-3 h-5 w-5"
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
                <h4 className="text-destructive font-medium">Error</h4>
                <p className="text-destructive mt-1 text-sm">
                  {contextErrors[0]?.message ||
                    deleteBotMutation.error?.message ||
                    'An error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </div>
            ) : (
              'Delete Bot'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBotModal;
