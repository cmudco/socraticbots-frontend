// src/components/books/BookFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { bookService } from '../../services/books.service';
import { Book } from '../../types/book';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreated: () => void;  
  book?: Book; 
}

const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose, onBookCreated, book }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a ref for the modal content
  const modalContentRef = useRef<HTMLDivElement>(null);
  
  // Determine if we're in edit mode
  const isEditMode = !!book;
  
  // Set form values when book changes (for edit mode)
  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setDescription(book.description || '');
    } else {
      // Reset form when not in edit mode
      setTitle('');
      setDescription('');
    }
  }, [book]);
  
  // Handle clicks outside of the modal content
  const handleOutsideClick = (e: MouseEvent) => {
    if (
      modalContentRef.current && 
      !modalContentRef.current.contains(e.target as Node) && 
      !isSubmitting
    ) {
      onClose();
    }
  };
  
  // Add event listener when modal is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, isSubmitting]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (isEditMode && book) {
        // Update existing book
        await bookService.updateBook(book.id, {
          title,
          description: description || undefined,
        });
      } else {
        // Create new book
        await bookService.createBook({
          title,
          description: description || undefined,
        });
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      
      // Close modal and notify parent
      onClose();
      onBookCreated(); 
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} book. Please try again.`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} book:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!title.trim()) {
          setError('Title is required');
          return;
        }
        
        const syntheticEvent = {
          preventDefault: () => {}
        } as unknown as React.FormEvent;
        
        handleSubmit(syntheticEvent);
      }
    };
  
    if (isOpen) {
      document.addEventListener('keydown', keyHandler);
    }
  
    return () => {
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isOpen, title, description]);
  
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalContentRef}
        className="bg-white p-6 rounded-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Book' : 'Create New Group'}
        </h2>
        
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
              {isSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Group')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookFormModal;
