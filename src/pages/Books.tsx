// src/pages/Books.tsx
import React from 'react';

import { Plus } from 'lucide-react';

import BookFormModal from '../components/books/BookFormModal';
import BookListEmpty from '../components/books/BookListEmpty';
import BookTable from '../components/books/BookTable';
import DeleteBookModal from '../components/books/DeleteBookModal';
import { Button } from '../components/ui/button';
import { useBooks } from '../hooks/queries/useBooks';
import { useModalStore } from '../stores/modalStore';
import { Book } from '../types/book';

const Books: React.FC = () => {
  // Use TanStack Query for books data
  const { data: books = [], isLoading: loading, error, isError } = useBooks();

  // Use Zustand for modal state management
  const {
    bookFormModal,
    deleteBookModal,
    openBookFormModal,
    closeBookFormModal,
    openDeleteBookModal,
    closeDeleteBookModal,
  } = useModalStore();

  // Modal handlers
  const handleOpenCreateModal = () => {
    openBookFormModal(); // No book = create mode
  };

  const handleOpenEditModal = (book: Book) => {
    openBookFormModal(book); // With book = edit mode
  };

  const handleOpenDeleteModal = (book: Book) => {
    openDeleteBookModal(book);
  };

  // Note: With TanStack Query, we don't need a manual refresh function
  // The cache will be automatically updated by the mutation hooks
  const handleBookSuccess = () => {
    // Cache will be updated automatically by TanStack Query mutations
    // This function is kept for compatibility with existing modals
  };

  const renderContent = () => {
    if (loading) {
      return <div className="p-4 text-center">Loading books...</div>;
    }

    if (isError) {
      return (
        <div className="p-4 text-center text-red-500">
          {error?.message || 'Could not load books. Please try again later.'}
        </div>
      );
    }

    if (books.length === 0) {
      return <BookListEmpty onCreateClick={handleOpenCreateModal} />;
    }

    return (
      <BookTable books={books} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
    );
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Books</h1>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-violet-600 text-white hover:bg-violet-700"
        >
          <Plus size={16} />
          Create New Book
        </Button>
      </div>

      {renderContent()}

      {/* Create/Edit Book Modal */}
      <BookFormModal
        isOpen={bookFormModal.isOpen}
        onClose={closeBookFormModal}
        onBookCreated={handleBookSuccess}
        book={bookFormModal.book || undefined}
      />

      {/* Delete Confirmation Modal */}
      {deleteBookModal.book && (
        <DeleteBookModal
          isOpen={deleteBookModal.isOpen}
          onClose={closeDeleteBookModal}
          onSuccess={handleBookSuccess}
          book={deleteBookModal.book}
        />
      )}
    </div>
  );
};

export default Books;
