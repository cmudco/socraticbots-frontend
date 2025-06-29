// src/components/books/BookFormModal.tsx
import React, { useCallback, useEffect, useState } from 'react';

import { BookOpen } from 'lucide-react';

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

import { useCreateBook, useUpdateBook } from '../../hooks/queries/useBooks';
import { Book } from '../../types/book';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreated: () => void;
  book?: Book;
}

const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose, onBookCreated, book }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // TanStack Query mutations
  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();

  // Determine if we're in edit mode
  const isEditMode = !!book;

  // Loading state from mutations
  const isSubmitting = createBookMutation.isPending || updateBookMutation.isPending;

  // Set form values when book changes (for edit mode)
  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setDescription(book.description || '');
    } else {
      // Reset form when not in edit mode
      setTitle('');
      setDescription('');
    }
  }, [book]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim()) {
        setError('Title is required');
        return;
      }

      try {
        setError(null);

        if (isEditMode && book) {
          // Update existing book
          await updateBookMutation.mutateAsync({
            id: book.id,
            bookData: {
              title,
              description: description || undefined,
            },
          });
        } else {
          // Create new book
          await createBookMutation.mutateAsync({
            title,
            description: description || undefined,
          });
        }

        // Reset form
        setTitle('');
        setDescription('');

        // Close modal and notify parent
        onClose();
        onBookCreated();
      } catch (err) {
        setError(`Failed to ${isEditMode ? 'update' : 'create'} book. Please try again.`);
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} book:`, err);
      }
    },
    [
      title,
      description,
      isEditMode,
      book,
      updateBookMutation,
      createBookMutation,
      onClose,
      onBookCreated,
    ]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!title.trim()) {
          setError('Title is required');
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
  }, [isOpen, title, description, handleSubmit]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
              <BookOpen className="h-5 w-5 text-violet-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              {isEditMode ? 'Edit Book' : 'Create New Book'}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-slate-600">
            {isEditMode
              ? 'Update the book details below.'
              : 'Fill in the details to create a new book.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
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
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Title *
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter book title"
              disabled={isSubmitting}
              className="border-slate-200 focus:border-violet-300 focus:ring-violet-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter book description (optional)"
              rows={4}
              disabled={isSubmitting}
              className="resize-none border-slate-200 focus:border-violet-300 focus:ring-violet-200"
            />
          </div>

          <DialogFooter className="flex gap-2 pt-4 sm:justify-end">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookFormModal;
