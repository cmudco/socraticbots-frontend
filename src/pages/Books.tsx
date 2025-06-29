// src/pages/Books.tsx
import React, { useState } from 'react';

import BookFormModal from '../components/books/BookFormModal';
import BookListEmpty from '../components/books/BookListEmpty';
import BookTable from '../components/books/BookTable';
import DeleteBookModal from '../components/books/DeleteBookModal';
import { useBooks } from '../hooks/queries/useBooks';
import { Book } from '../types/book';

const Books: React.FC = () => {
  // Use TanStack Query for books data
  const { data: books = [], isLoading: loading, error, isError } = useBooks();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setSelectedBook(null); // Ensure no book is selected for create mode
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setSelectedBook(book);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
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
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleOpenCreateModal}
        >
          Create New Book
        </button>
      </div>

      {renderContent()}

      {/* Create/Edit Book Modal */}
      <BookFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onBookCreated={handleBookSuccess}
        book={selectedBook || undefined}
      />

      {/* Delete Confirmation Modal */}
      {selectedBook && (
        <DeleteBookModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onSuccess={handleBookSuccess}
          book={selectedBook}
        />
      )}
    </div>
  );
};

export default Books;
