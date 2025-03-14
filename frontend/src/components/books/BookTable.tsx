// src/components/books/BookTable.tsx
import React from 'react';
import { Book } from '../../types/book';

interface BookTableProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  // Removed onView prop
}

const BookTable: React.FC<BookTableProps> = ({ books, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Title</th>
            <th className="py-2 px-4 text-left">Description</th>
            <th className="py-2 px-4 text-left">Created</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4 font-medium">{book.title}</td>
              <td className="py-2 px-4">{book.description ? book.description.substring(0, 50) + (book.description.length > 50 ? '...' : '') : '-'}</td>
              <td className="py-2 px-4 text-sm text-gray-500">
                {new Date(book.created_at).toLocaleDateString()}
              </td>
              <td className="py-2 px-4">
                <button 
                  onClick={() => onEdit(book)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(book)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookTable;
