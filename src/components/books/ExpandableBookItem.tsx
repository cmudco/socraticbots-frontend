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
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
        onClick={toggleExpand}
      >
        <div>
          <h3 className="font-bold text-lg">{book.title}</h3>
          {book.description && <p className="text-gray-600 text-sm">{book.description}</p>}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent toggling expand
              onEdit(book);
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent toggling expand
              onDelete(book);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
          <span className="text-gray-400">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t p-4 bg-gray-50">
          <ChapterList
            bookId={book.id}
            initialChapters={[]}
            onChapterDeleted={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default ExpandableBookItem;
