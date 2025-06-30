// src/components/books/BookListEmpty.tsx
import React from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface BookListEmptyProps {
  onCreateClick: () => void;
}

const BookListEmpty: React.FC<BookListEmptyProps> = ({ onCreateClick }) => {
  return (
    <div className="rounded-lg bg-gray-50 p-6 text-center">
      <h3 className="text-lg font-medium text-gray-600">No Books Found</h3>
      <p className="mt-1 text-gray-500">You don't have any books yet.</p>
      <Button onClick={onCreateClick} className="mt-4">
        <Plus size={16} />
        Create Your First Book
      </Button>
    </div>
  );
};

export default BookListEmpty;
