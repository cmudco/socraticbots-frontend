import React, { useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

import { useDeleteBook } from '@/hooks/queries/useBooks';

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

import { Book } from '@/types/book';

interface DeleteBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  book: Book;
}

const DeleteBookModal: React.FC<DeleteBookModalProps> = ({ isOpen, onClose, onSuccess, book }) => {
  const { addError, clearErrorsByContext, getErrorsByContext } = useErrorStore();

  const deleteBookMutation = useDeleteBook();

  const isDeleting = deleteBookMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      clearErrorsByContext('deleteBook');
    }
  }, [isOpen, clearErrorsByContext]);

  const handleDelete = async () => {
    try {
      clearErrorsByContext('deleteBook');

      await deleteBookMutation.mutateAsync(book.id);

      onClose();
      onSuccess();
    } catch (err) {
      addError('Failed to delete book. Please try again.', 'error', 'deleteBook');
      console.error('Error deleting book:', err);
    }
  };

  const contextErrors = getErrorsByContext('deleteBook');
  const hasError = contextErrors.length > 0 || deleteBookMutation.isError;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Delete Book</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-slate-600">
            Are you sure you want to delete "<span className="font-semibold">{book.title}</span>"?
            This action cannot be undone.
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
                    deleteBookMutation.error?.message ||
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
              'Delete Book'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBookModal;
