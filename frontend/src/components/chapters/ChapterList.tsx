// src/components/chapters/ChapterList.tsx - Fix for delete operation
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setChapters, setCurrentBookId, removeChapter } from '../../store/slices/chaptersSlice';
import { deleteChapter } from '../../store/thunks/chapterThunks';
import { Chapter } from '../../services/chapters.service';
import ChapterItem from './ChapterItem';
import ChapterFormModal from './ChapterFormModal';

interface ChapterListProps {
  bookId: string;
  initialChapters: Chapter[];
  onChapterAdded?: (chapter: Chapter) => void;
  onChapterUpdated?: (chapter: Chapter) => void;
  onChapterDeleted?: (chapterId: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ 
  bookId, 
  initialChapters,
  onChapterAdded,
  onChapterUpdated,
  onChapterDeleted
}) => {
  const dispatch = useAppDispatch();
  
  // Get chapters from Redux store with a fallback to initialChapters
  const chaptersState = useAppSelector(state => state.chapters);
  const chapters = chaptersState?.chapters || initialChapters || [];
  const loading = chaptersState?.loading || false;
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  
  // Local state for tracking deleted chapter IDs to immediately hide them
  const [deletedChapterIds, setDeletedChapterIds] = useState<string[]>([]);

  // Initialize Redux state with props
  useEffect(() => {
    dispatch(setChapters(initialChapters || []));
    dispatch(setCurrentBookId(bookId));
  }, [bookId, initialChapters, dispatch]);

  // Listen for changes in the Redux state to call parent callbacks
  useEffect(() => {
    if (chapters && initialChapters) {
      // ... existing code for added/updated chapters ...
    }
  }, [chapters, initialChapters, onChapterAdded, onChapterUpdated]);

  const handleOpenCreateModal = () => {
    setSelectedChapter(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      try {
        // Immediately update local state to hide the chapter
        setDeletedChapterIds(prev => [...prev, chapterId]);
        
        // Also update Redux store immediately
        dispatch(removeChapter(chapterId));
        
        // Notify parent component
        if (onChapterDeleted) {
          onChapterDeleted(chapterId);
        }
        
        // Then make the API call
        await dispatch(deleteChapter({ bookId, chapterId })).unwrap();
      } catch (error: any) {
        console.error('Error deleting chapter:', error.message);
        
        // If there was an error, revert the UI change
        if (error.message !== 'Request failed with status code 404') {
          setDeletedChapterIds(prev => prev.filter(id => id !== chapterId));
          
          // Re-fetch the chapter list would be ideal here, but for now we'll just
          // restore the chapter in our Redux store if it failed for a reason other than 404
          if (initialChapters) {
            const chapterToRestore = initialChapters.find(ch => ch.id === chapterId);
            if (chapterToRestore) {
              dispatch(setChapters([...chapters.filter(ch => ch.id !== chapterId), chapterToRestore]));
            }
          }
        }
      }
    }
  };

  // Filter out deleted chapters from the display
  const visibleChapters = chapters.filter(chapter => 
    !deletedChapterIds.includes(chapter.id)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-md">Bots</h3>
        <button
          onClick={handleOpenCreateModal}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        >
          Add Bot
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading bots...</p>
      ) : visibleChapters.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No bots yet. Add your first bot!</p>
      ) : (
        <div className="space-y-2">
          {visibleChapters.map((chapter: Chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              onEdit={() => handleOpenEditModal(chapter)}
              onDelete={() => handleDeleteChapter(chapter.id)}
            />
          ))}
        </div>
      )}

      <ChapterFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        chapter={selectedChapter}
        bookId={bookId}
      />
    </div>
  );
};

export default ChapterList;
