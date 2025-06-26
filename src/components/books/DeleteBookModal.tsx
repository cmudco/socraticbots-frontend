// src/components/books/DeleteBookModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../../types/book';
import { useDeleteBook } from '../../hooks/queries/useBooks';

interface DeleteBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  book: Book;
}

const DeleteBookModal: React.FC<DeleteBookModalProps> = ({ isOpen, onClose, onSuccess, book }) => {
  const [error, setError] = useState<string | null>(null);

  // TanStack Query mutation
  const deleteBookMutation = useDeleteBook();

  // Create ref for modal content
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Loading state from mutation
  const isDeleting = deleteBookMutation.isPending;

  // Handle clicks outside the modal
  const handleOutsideClick = (e: MouseEvent) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target as Node) &&
      !isDeleting
    ) {
      onClose();
    }
  };

  // Add event listener when modal is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, isDeleting]); const handleDelete = async () => {
    try {
      setError(null);

      await deleteBookMutation.mutateAsync(book.id);

      onClose();
      onSuccess();
    } catch (err) {
      setError('Failed to delete book. Please try again.');
      console.error('Error deleting book:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalContentRef}
        className="bg-white p-6 rounded-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Delete Book</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <p className="mb-4">
          Are you sure you want to delete "<span className="font-semibold">{book.title}</span>"?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBookModal;
