import React from 'react';

import { Plus } from 'lucide-react';

import { useBooks } from '@/hooks/queries/useBooks';
import { useAuth } from '@/hooks/useAuth';

import { useModalStore } from '@/stores/ui/modalStore';

import BookFormModal from '@/components/books/BookFormModal';
import BookListEmpty from '@/components/books/BookListEmpty';
import BookTable from '@/components/books/BookTable';
import DeleteBookModal from '@/components/books/DeleteBookModal';
import { Button } from '@/components/ui/button';

import { Book } from '@/types/book';

const Books: React.FC = () => {
  const { data: books = [], isLoading: loading, error, isError } = useBooks();

  const { user } = useAuth();

  const {
    bookFormModal,
    deleteBookModal,
    openBookFormModal,
    closeBookFormModal,
    openDeleteBookModal,
    closeDeleteBookModal,
  } = useModalStore();

  const handleOpenCreateModal = () => {
    openBookFormModal(); // No book = create mode
  };

  const handleOpenEditModal = (book: Book) => {
    openBookFormModal(book);
  };

  const handleOpenViewModal = (book: Book) => {
    openBookFormModal(book, true);
  };

  const handleOpenDeleteModal = (book: Book) => {
    openDeleteBookModal(book);
  };

  const handleBookSuccess = () => {};

  const renderContent = () => {
    if (loading) {
      return <div className="p-4 text-center">Loading chatbot groups...</div>;
    }

    if (isError) {
      return (
        <div className="p-4 text-center text-red-500">
          {error?.message || 'Could not load chatbot groups. Please try again later.'}
        </div>
      );
    }

    if (books.length === 0) {
      if (user?.is_professor) {
        return <BookListEmpty onCreateClick={handleOpenCreateModal} />;
      } else {
        return (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600">No Chatbot Groups Available</h3>
            <p className="mt-1 text-gray-500">
              You don't have access to any chatbot groups yet. Please contact your instructor for an
              access code.
            </p>
          </div>
        );
      }
    }

    return (
      <BookTable
        books={books}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onView={handleOpenViewModal}
      />
    );
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chatbot groups</h1>
        {/* Only show Create New Chatbot Group button for professors */}
        {user?.is_professor && (
          <Button
            onClick={handleOpenCreateModal}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            <Plus size={16} />
            Create New Chatbot Group
          </Button>
        )}
      </div>

      {renderContent()}

      <BookFormModal
        isOpen={bookFormModal.isOpen}
        onClose={closeBookFormModal}
        onBookCreated={handleBookSuccess}
        book={bookFormModal.book || undefined}
        viewOnly={bookFormModal.mode === 'view'}
      />

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
