// src/components/books/BookTable.tsx
import React from 'react';
import { Book } from '../../types/book';

interface BookTableProps {
  books: Book[];
}

const BookTable: React.FC<BookTableProps> = ({ books }) => {
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
              <td className="py-2 px-4">{book.description || '-'}</td>
              <td className="py-2 px-4 text-sm text-gray-500">
                {new Date(book.created_at).toLocaleDateString()}
              </td>
              <td className="py-2 px-4">
                <button className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                <button className="text-blue-500 hover:text-blue-700">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookTable;
