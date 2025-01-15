import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface ChapterNotesProps {
  chapterId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChapterNotes: React.FC<ChapterNotesProps> = ({
  chapterId,
  userId,
  isOpen,
  onClose
}) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

   // Add ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);


  // Load notes when component mounts
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}/notes?userId=${userId}`
        );
        if (!response.ok) throw new Error('Failed to load notes');
        const data = await response.json();
        setNotes(data.content || '');
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };

    if (isOpen) {
      loadNotes();
    }
  }, [chapterId, userId, isOpen]);

  // Debounced save function
  const saveNotes = useCallback(
    debounce(async (content: string) => {
      try {
        setIsSaving(true);
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}/notes?userId=${userId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content })
          }
        );
        
        if (!response.ok) throw new Error('Failed to save notes');
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving notes:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [chapterId, userId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setNotes(newContent);
    saveNotes(newContent);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Notes Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Notes</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            <textarea
              value={notes}
              onChange={handleChange}
              className="w-full h-full p-2 border rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your notes here..."
            />
          </div>
          
          <div className="p-2 text-sm text-gray-500 border-t">
            {isSaving ? (
              <span>Saving...</span>
            ) : lastSaved ? (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterNotes;