// src/components/books/BookFormModal.tsx
import React, { useState, useEffect } from 'react';
import { useBookService } from '../../services/books.service';

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
  
  const bookService = useBookService();
  
  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setError(null);
    }
  }, [isOpen]);
  
  // If not open, don't render anything
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await bookService.createBook({
        title: title.trim(),
        description: description.trim() || undefined
      });
      
      // Notify parent and close modal
      onBookCreated();
      onClose();
      
    } catch (err) {
      console.error('Error creating book:', err);
      setError('Failed to create book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      {/* Much more transparent overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-50"
        onClick={onClose}
      />
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Book</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter book title"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter book description (optional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 mr-2"
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
    </>
  );
};

export default BookFormModal;
