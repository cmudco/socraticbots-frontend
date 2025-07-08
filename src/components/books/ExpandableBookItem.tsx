// src/components/books/ExpandableBookItem.tsx
import React, { useState } from 'react';

import { ChevronDown, ChevronUp, Edit, Eye, Trash } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

import { useUiStore } from '@/stores/ui/uiStore';

import ChapterList from '@/components/chapters/ChapterList';
import { Button } from '@/components/ui/button';

import { Book } from '@/types/book';

interface ExpandableBookItemProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onView?: (book: Book) => void; // New prop for view action
}

const ExpandableBookItem: React.FC<ExpandableBookItemProps> = ({
  book,
  onEdit,
  onDelete,
  onView,
}) => {
  // Get user information for access control
  const { user } = useAuth();

  // Zustand for UI state (book expansion)
  const { expandedBooks, toggleBookExpansion } = useUiStore();
  const expanded = expandedBooks.has(book.id);

  // React state only for temporary hover interactions
  const [showActions, setShowActions] = useState(false);

  const toggleExpand = () => {
    toggleBookExpansion(book.id);
  };

  return (
    <div className="mb-4 overflow-hidden rounded-lg border">
      <div
        className="group flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50"
        onClick={toggleExpand}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex-1">
          <h3 className="text-lg font-bold">{book.title}</h3>
          {book.description && <p className="text-sm text-gray-600">{book.description}</p>}
        </div>

        <div className="flex items-center space-x-3">
          {/* Book actions - visible on hover */}
          <div
            className={`flex space-x-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}
          >
            {user?.is_professor ? (
              /* Professor actions: Edit and Delete */
              <>
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(book);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                  title="Edit book"
                >
                  <Edit size={14} className="mr-1" />
                  Edit Book
                </Button>
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(book);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs text-gray-600 hover:bg-red-100 hover:text-red-700"
                  title="Delete book"
                >
                  <Trash size={14} className="mr-1" />
                  Delete
                </Button>
              </>
            ) : (
              /* Student action: View only */
              onView && (
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    onView(book);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                  title="View book details"
                >
                  <Eye size={14} className="mr-1" />
                  View Details
                </Button>
              )
            )}
          </div>

          {/* Expand/collapse indicator - always visible */}
          <div className="flex items-center">
            {expanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
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
