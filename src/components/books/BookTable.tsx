import React from 'react';

import { Book } from '@/types/book';

import ExpandableBookItem from './ExpandableBookItem';

interface BookTableProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onView?: (book: Book) => void;
}

const BookTable: React.FC<BookTableProps> = ({ books, onEdit, onDelete, onView }) => {
  return (
    <div className="space-y-4">
      {books.map(book => (
        <ExpandableBookItem
          key={book.id}
          book={book}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default BookTable;
