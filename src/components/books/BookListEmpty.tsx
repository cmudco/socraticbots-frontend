// src/components/books/BookListEmpty.tsx
import React from 'react';

interface BookListEmptyProps {
  onCreateClick: () => void;
}

const BookListEmpty: React.FC<BookListEmptyProps> = ({ onCreateClick }) => {
  return (
    <div className="rounded-lg bg-gray-50 p-6 text-center">
      <h3 className="text-lg font-medium text-gray-600">No Books Found</h3>
      <p className="mt-1 text-gray-500">You don't have any books yet.</p>
      <button
        onClick={onCreateClick}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Create Your First Book
      </button>
    </div>
  );
};

export default BookListEmpty;
