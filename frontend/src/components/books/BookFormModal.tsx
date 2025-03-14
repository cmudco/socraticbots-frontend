// src/components/books/BookFormModal.tsx
import React, { useState } from 'react';
// Update this import to use the singleton service
import { bookService } from '../../services/books.service';
import { CreateBookRequest } from '../../services/books.service';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreated: () => void;
}

const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose, onBookCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Remove this line - no longer needed
  // const bookService = useBookService();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newBook: CreateBookRequest = {
        title,
        description: description || undefined,
      };
      
      await bookService.createBook(newBook);
      
      // Reset form
      setTitle('');
      setDescription('');
      
      // Close modal and notify parent
      onClose();
      onBookCreated();
    } catch (err) {
      setError('Failed to create book. Please try again.');
      console.error('Error creating book:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Book</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="title">
              Title*
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookFormModal;
