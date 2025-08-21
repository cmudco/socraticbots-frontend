import React, { useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

import { useDeleteBot } from '@/hooks/queries/useBots';

import { useErrorStore } from '@/stores/ui/errorStore';

import { Bot } from '@/types/bot';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Delete Bot</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-slate-600">
            Are you sure you want to delete "<span className="font-semibold">{bot.title}</span>
            "? This action cannot be undone and all associated data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

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
                    deleteBotMutation.error?.message ||
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
              'Delete Bot'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBotModal;