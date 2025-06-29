// src/components/chapters/ChapterList.tsx - Migrated to TanStack Query
import React, { useState } from 'react';
import { Chapter } from '../../services/chapters.service';
import { useChapters, } from '../../hooks/queries/useChapters';
import ChapterItem from './ChapterItem';
import ChapterFormModal from './ChapterFormModal';
import DeleteChapterModal from './DeleteChapterModal';

interface ChapterListProps {
  bookId: string;
  initialChapters: Chapter[];
  onChapterDeleted?: (chapterId: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  bookId,
  initialChapters,
  onChapterDeleted
}) => {
  // Use TanStack Query for chapters data
  const {
    data: chapters = initialChapters || [],
    isLoading: loading,
    error
  } = useChapters(bookId);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);

  // Local state for tracking deleted chapter IDs to immediately hide them
  const [deletedChapterIds, setDeletedChapterIds] = useState<string[]>([]);

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

  const handleDeleteChapter = (chapter: Chapter) => {
    setChapterToDelete(chapter);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setChapterToDelete(null);
  };

  const handleConfirmDelete = (chapterId: string) => {
    // Immediately update local state to hide the chapter
    setDeletedChapterIds(prev => [...prev, chapterId]);

    // Notify parent component
    onChapterDeleted?.(chapterId);
  };

  // Filter out deleted chapters from the display
  const visibleChapters = chapters.filter(chapter =>
    !deletedChapterIds.includes(chapter.id)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-md">Chapters</h3>
        <button
          onClick={handleOpenCreateModal}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        >
          Add Chapter
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading chapters...</p>
      ) : error ? (
        <p className="text-red-500 text-center py-4">Error loading chapters: {error.message}</p>
      ) : visibleChapters.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No chapters yet. Add your first chapter!</p>
      ) : (
        <div className="space-y-2">
          {visibleChapters.map((chapter: Chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              onEdit={() => handleOpenEditModal(chapter)}
              onDelete={() => handleDeleteChapter(chapter)}
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

      {chapterToDelete && (
        <DeleteChapterModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onSuccess={() => handleConfirmDelete(chapterToDelete.id)}
          chapter={chapterToDelete}
          bookId={bookId}
        />
      )}
    </div>
  );
};

export default ChapterList;
