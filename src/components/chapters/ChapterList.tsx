// src/components/chapters/ChapterList.tsx - Migrated to TanStack Query + Zustand
import React from 'react';

import { Plus } from 'lucide-react';

import { useChapters } from '@/hooks/queries/useChapters';

import { useModalStore } from '@/stores/ui/modalStore';
import { useUiStore } from '@/stores/ui/uiStore';

import { Chapter } from '@/services/chapters.service';

import { Button } from '@/components/ui/button';

import ChapterFormModal from './ChapterFormModal';
import ChapterItem from './ChapterItem';
import DeleteChapterModal from './DeleteChapterModal';

interface ChapterListProps {
  bookId: string;
  initialChapters: Chapter[];
  onChapterDeleted?: (chapterId: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ bookId, initialChapters, onChapterDeleted }) => {
  // Use TanStack Query for chapters data
  const { data: chapters = initialChapters || [], isLoading: loading, error } = useChapters(bookId);

  // Use Zustand for modal and UI state management
  const {
    chapterFormModal,
    deleteChapterModal,
    openChapterFormModal,
    closeChapterFormModal,
    openDeleteChapterModal,
    closeDeleteChapterModal,
  } = useModalStore();

  // Use UI store for tracking deleted chapters (for immediate UI feedback)
  const { deletedChapterIds, addDeletedChapter } = useUiStore();

  const handleOpenCreateModal = () => {
    openChapterFormModal(bookId); // No chapter = create mode
  };

  const handleOpenEditModal = (chapter: Chapter) => {
    openChapterFormModal(bookId, chapter); // With chapter = edit mode
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    openDeleteChapterModal(bookId, chapter);
  };

  const handleConfirmDelete = (chapterId: string) => {
    // Immediately update local state to hide the chapter
    addDeletedChapter(chapterId);

    // Notify parent component
    onChapterDeleted?.(chapterId);
  };

  // Filter out deleted chapters from the display
  const visibleChapters = chapters.filter(chapter => !deletedChapterIds.has(chapter.id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-md font-semibold">Chapters</h3>
        <Button onClick={handleOpenCreateModal} size="sm" variant="outline">
          <Plus size={14} />
          Add Chapter
        </Button>
      </div>

      {loading ? (
        <p className="py-4 text-center text-gray-500">Loading chapters...</p>
      ) : error ? (
        <p className="py-4 text-center text-red-500">Error loading chapters: {error.message}</p>
      ) : visibleChapters.length === 0 ? (
        <p className="py-4 text-center text-gray-500">No chapters yet. Add your first chapter!</p>
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
        isOpen={chapterFormModal.isOpen}
        onClose={closeChapterFormModal}
        chapter={chapterFormModal.chapter}
        bookId={chapterFormModal.bookId || bookId}
      />

      {deleteChapterModal.chapter && deleteChapterModal.bookId && (
        <DeleteChapterModal
          isOpen={deleteChapterModal.isOpen}
          onClose={closeDeleteChapterModal}
          onSuccess={() => handleConfirmDelete(deleteChapterModal.chapter!.id)}
          chapter={deleteChapterModal.chapter}
          bookId={deleteChapterModal.bookId}
        />
      )}
    </div>
  );
};

export default ChapterList;
