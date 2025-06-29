// src/components/books/ExpandableBookItem.tsx
import React, { useState } from 'react';

import { Book } from '../../types/book';
import ChapterList from '../chapters/ChapterList';

interface ExpandableBookItemProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

const ExpandableBookItem: React.FC<ExpandableBookItemProps> = ({ book, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="mb-4 overflow-hidden rounded-lg border">
      <div
        className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50"
        onClick={toggleExpand}
      >
        <div>
          <h3 className="text-lg font-bold">{book.title}</h3>
          {book.description && <p className="text-sm text-gray-600">{book.description}</p>}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={e => {
              e.stopPropagation(); // Prevent toggling expand
              onEdit(book);
            }}
            className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={e => {
              e.stopPropagation(); // Prevent toggling expand
              onDelete(book);
            }}
            className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
          >
            Delete
          </button>
          <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-gray-50 p-4">
          <ChapterList bookId={book.id} initialChapters={[]} onChapterDeleted={() => {}} />
        </div>
      )}
    </div>
  );
};

export default ExpandableBookItem;
