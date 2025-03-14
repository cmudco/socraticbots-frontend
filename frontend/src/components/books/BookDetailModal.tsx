// src/components/books/BookDetailModal.tsx
import React from 'react';
import { Book } from '../../types/book';

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({ isOpen, onClose, book }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Book Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="border-b pb-4 mb-4">
          <h3 className="text-2xl font-bold">{book.title}</h3>
          <p className="text-gray-500 mt-1">
            Created on {new Date(book.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Description</h4>
          <p className="text-gray-700 whitespace-pre-wrap">
            {book.description || 'No description provided.'}
          </p>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">ID</p>
              <p>{book.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Created At</p>
              <p>{new Date(book.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Updated At</p>
              <p>{new Date(book.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
