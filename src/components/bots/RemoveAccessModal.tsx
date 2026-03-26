import React, { useEffect, useState } from 'react';

import { AlertTriangle, UserX } from 'lucide-react';

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

interface RemoveAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  userEmail: string;
  userName: string;
  accessType: string;
}

const RemoveAccessModal: React.FC<RemoveAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  userName,
  accessType,
}) => {
  const { addError, clearErrorsByContext, getErrorsByContext } = useErrorStore();
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      clearErrorsByContext('removeAccess');
    }
  }, [isOpen, clearErrorsByContext]);

  const handleRemoveAccess = async () => {
    try {
      setIsRemoving(true);
      clearErrorsByContext('removeAccess');

      await onSuccess();

      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to remove user access. Please try again.';
      addError(errorMessage, 'error', 'removeAccess');
      console.error('Error removing user access:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  const contextErrors = getErrorsByContext('removeAccess');
  const hasError = contextErrors.length > 0;

  const getAccessTypeDescription = () => {
    switch (accessType) {
      case 'direct_bot':
        return 'direct bot access';
      case 'bot_group':
        return 'bot group access';
      case 'bot_group_collaborator':
        return 'collaborator access';
      default:
        return 'access';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
              <UserX className="text-destructive h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-semibold">Remove Access</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground pt-2">
            Are you sure you want to remove{' '}
            <span className="font-semibold">{userName || userEmail}</span>'s{' '}
            {getAccessTypeDescription()}? This action cannot be undone and the user will no longer
            be able to access this bot.
          </DialogDescription>
        </DialogHeader>

        {hasError && (
          <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-4">
            <div className="flex items-start">
              <AlertTriangle className="text-destructive mt-0.5 mr-3 h-5 w-5" />
              <div>
                <h4 className="text-destructive font-medium">Error</h4>
                <p className="text-destructive mt-1 text-sm">
                  {contextErrors[0]?.message || 'An error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-start">
            <AlertTriangle className="mt-0.5 mr-3 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Warning</h4>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Removing access will prevent this user from accessing the bot. If they have other
                access methods (like bot group access), they may still be able to access the bot
                through those means.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isRemoving}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemoveAccess} disabled={isRemoving}>
            {isRemoving ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Removing...
              </div>
            ) : (
              'Remove Access'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveAccessModal;
