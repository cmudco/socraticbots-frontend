// src/components/books/ExpandableBookItem.tsx
import React, { useState } from 'react';
import { Book } from '../../types/book';
import { Chapter } from '../../services/chapters.service';
import ChapterList from '../chapters/ChapterList';
import { chapterService } from '../../services/chapters.service';

interface ExpandableBookItemProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

const ExpandableBookItem: React.FC<ExpandableBookItemProps> = ({ book, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = async () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    
    if (newExpandedState && chapters.length === 0) {
      // Fetch chapters when expanding
      setLoading(true);
      try {
        const fetchedChapters = await chapterService.getChapters(book.id);
        setChapters(fetchedChapters);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChapterAdded = (newChapter: Chapter) => {
    setChapters([...chapters, newChapter]);
  };

  const handleChapterUpdated = (updatedChapter: Chapter) => {
    setChapters(chapters.map(ch => ch.id === updatedChapter.id ? updatedChapter : ch));
  };

  const handleChapterDeleted = (chapterId: string) => {
    setChapters(chapters.filter(ch => ch.id !== chapterId));
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
          {loading ? (
            <div className="text-center py-4">Loading chapters...</div>
          ) : (
            <ChapterList 
              bookId={book.id}
              initialChapters={chapters}
              onChapterAdded={handleChapterAdded}
              onChapterUpdated={handleChapterUpdated}
              onChapterDeleted={handleChapterDeleted}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ExpandableBookItem;
