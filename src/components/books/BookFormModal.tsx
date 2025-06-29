// src/components/books/BookFormModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Book } from '../../types/book';
import { useCreateBook, useUpdateBook } from '../../hooks/queries/useBooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen } from 'lucide-react';

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
          }
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
  }, [title, description, isEditMode, book, updateBookMutation, createBookMutation, onClose, onBookCreated]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!title.trim()) {
          setError('Title is required');
          return;
        }

        const syntheticEvent = {
          preventDefault: () => { }
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
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              {isEditMode ? 'Edit Book' : 'Create New Book'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 pt-2">
            {isEditMode ? 'Update the book details below.' : 'Fill in the details to create a new book.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-red-800 font-medium">Error</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
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
              onChange={(e) => setTitle(e.target.value)}
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
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter book description (optional)"
              rows={4}
              disabled={isSubmitting}
              className="border-slate-200 focus:border-violet-300 focus:ring-violet-200 resize-none"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end pt-4">
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
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </div>
              ) : (
                isEditMode ? 'Save Changes' : 'Create Book'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookFormModal;
