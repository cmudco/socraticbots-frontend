import React, { useCallback, useEffect } from 'react';

import { BookOpen } from 'lucide-react';

import { useCreateBook, useUpdateBook } from '@/hooks/queries/useBooks';

import { useFormStore } from '@/stores/forms/formStore';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Book } from '@/types/book';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreated: () => void;
  book?: Book;
  viewOnly?: boolean;
}

const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onBookCreated,
  book,
  viewOnly = false,
}) => {
  const {
    bookForm,
    setBookFormField,
    setBookFormError,
    clearBookFormErrors,
    resetBookForm,
    setBookFormData,
  } = useFormStore();

  const { addError, clearErrorsByContext } = useErrorStore();

  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();

  const isEditMode = !!book;

  const isSubmitting = createBookMutation.isPending || updateBookMutation.isPending;

  useEffect(() => {
    if (book) {
      setBookFormData({
        title: book.title,
        description: book.description || '',
        errors: {},
      });
    } else {
      resetBookForm();
    }
  }, [book, setBookFormData, resetBookForm]);

  useEffect(() => {
    if (isOpen) {
      clearBookFormErrors();
      clearErrorsByContext('bookForm');
    }
  }, [isOpen, clearBookFormErrors, clearErrorsByContext]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!bookForm.title.trim()) {
        setBookFormError('title', 'Title is required');
        return;
      }

      try {
        clearBookFormErrors();
        clearErrorsByContext('bookForm');

        if (isEditMode && book) {
          await updateBookMutation.mutateAsync({
            id: book.id,
            bookData: {
              title: bookForm.title,
              description: bookForm.description || undefined,
            },
          });
        } else {
          await createBookMutation.mutateAsync({
            title: bookForm.title,
            description: bookForm.description || undefined,
          });
        }

        resetBookForm();
        onClose();
        onBookCreated();
      } catch (err) {
        const errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} book. Please try again.`;
        addError(errorMessage, 'error', 'bookForm');
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} book:`, err);
      }
    },
    [
      bookForm,
      isEditMode,
      book,
      setBookFormError,
      clearBookFormErrors,
      clearErrorsByContext,
      updateBookMutation,
      createBookMutation,
      resetBookForm,
      onClose,
      onBookCreated,
      addError,
    ]
  );

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!bookForm.title.trim()) {
          setBookFormError('title', 'Title is required');
          return;
        }

        const syntheticEvent = {
          preventDefault: () => {},
        } as unknown as React.FormEvent;

        handleSubmit(syntheticEvent);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', keyHandler);
    }

    return () => {
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isOpen, bookForm.title, handleSubmit, setBookFormError]);

  const formErrors = bookForm.errors;
  const hasGlobalError =
    Object.keys(formErrors).length === 0 &&
    (createBookMutation.isError || updateBookMutation.isError);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
              <BookOpen className="h-5 w-5 text-violet-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              {viewOnly ? 'Book Details' : isEditMode ? 'Edit Book' : 'Create New Book'}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-slate-600">
            {viewOnly
              ? 'View book information below.'
              : isEditMode
                ? 'Update the book details below.'
                : 'Fill in the details to create a new book.'}
          </DialogDescription>
        </DialogHeader>

        {hasGlobalError && (
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
                  {createBookMutation.error?.message ||
                    updateBookMutation.error?.message ||
                    'An error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={viewOnly ? undefined : handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Title {!viewOnly && '*'}
            </Label>
            <Input
              id="title"
              type="text"
              value={bookForm.title}
              onChange={viewOnly ? undefined : e => setBookFormField('title', e.target.value)}
              placeholder={viewOnly ? undefined : 'Enter book title'}
              disabled={viewOnly || isSubmitting}
              readOnly={viewOnly}
              className="border-slate-200 focus:border-violet-300 focus:ring-violet-200"
            />
            {!viewOnly && formErrors.title && (
              <p className="text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={bookForm.description}
              onChange={viewOnly ? undefined : e => setBookFormField('description', e.target.value)}
              placeholder={
                viewOnly ? 'No description provided' : 'Enter book description (optional)'
              }
              rows={4}
              disabled={viewOnly || isSubmitting}
              readOnly={viewOnly}
              className="resize-none border-slate-200 focus:border-violet-300 focus:ring-violet-200"
            />
            {!viewOnly && formErrors.description && (
              <p className="text-sm text-red-600">{formErrors.description}</p>
            )}
          </div>

          <DialogFooter className="flex gap-2 pt-4 sm:justify-end">
            {viewOnly ? (
              <Button
                type="button"
                onClick={onClose}
                className="bg-violet-600 text-white hover:bg-violet-700"
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-violet-600 text-white hover:bg-violet-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {isEditMode ? 'Saving...' : 'Creating...'}
                    </div>
                  ) : isEditMode ? (
                    'Save Changes'
                  ) : (
                    'Create Book'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookFormModal;
