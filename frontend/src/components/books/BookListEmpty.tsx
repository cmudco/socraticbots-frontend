// src/components/books/BookListEmpty.tsx
import React from 'react';

interface BookListEmptyProps {
  onCreateClick: () => void;
}

const BookListEmpty: React.FC<BookListEmptyProps> = ({ onCreateClick }) => {
  return (
    <div className="text-center p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-600">No Books Found</h3>
      <p className="mt-1 text-gray-500">You don't have any books yet.</p>
      <button 
        onClick={onCreateClick}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Your First Book
      </button>
    </div>
  );
};

export default BookListEmpty;