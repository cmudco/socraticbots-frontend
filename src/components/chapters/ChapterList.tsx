import React from 'react';

import { Plus } from 'lucide-react';

import { useChapters } from '@/hooks/queries/useChapters';

import { useAuthStore } from '@/stores/authStore';
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
  const { data: chapters = initialChapters || [], isLoading: loading, error } = useChapters(bookId);

  const { user } = useAuthStore();

  const {
    chapterFormModal,
    deleteChapterModal,
    openChapterFormModal,
    closeChapterFormModal,
    openDeleteChapterModal,
    closeDeleteChapterModal,
  } = useModalStore();

  const { deletedChapterIds, addDeletedChapter } = useUiStore();

  const handleOpenCreateModal = () => {
    openChapterFormModal(bookId); // No chapter = create mode
  };

  const handleOpenEditModal = (chapter: Chapter) => {
    openChapterFormModal(bookId, chapter);
  };

  const handleOpenViewModal = (chapter: Chapter) => {
    openChapterFormModal(bookId, chapter, true);
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    openDeleteChapterModal(bookId, chapter);
  };

  const handleConfirmDelete = (chapterId: string) => {
    addDeletedChapter(chapterId);

    onChapterDeleted?.(chapterId);
  };

  const visibleChapters = chapters.filter(chapter => !deletedChapterIds.has(chapter.id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-md font-semibold">Bots</h3>
        {user?.isProfessor && (
          <Button onClick={handleOpenCreateModal} size="sm" variant="outline">
            <Plus size={14} />
            Add Bot
          </Button>
        )}
      </div>

      {loading ? (
        <p className="py-4 text-center text-gray-500">Loading bots...</p>
      ) : error ? (
        <p className="py-4 text-center text-red-500">Error loading bots: {error.message}</p>
      ) : visibleChapters.length === 0 ? (
        <p className="py-4 text-center text-gray-500">
          {user?.isProfessor ? 'No bots yet. Add your first bot!' : 'No bots available.'}
        </p>
      ) : (
        <div className="space-y-2">
          {visibleChapters.map((chapter: Chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              onEdit={() => handleOpenEditModal(chapter)}
              onDelete={() => handleDeleteChapter(chapter)}
              onView={() => handleOpenViewModal(chapter)}
            />
          ))}
        </div>
      )}

      <ChapterFormModal
        isOpen={chapterFormModal.isOpen}
        onClose={closeChapterFormModal}
        chapter={chapterFormModal.chapter}
        bookId={chapterFormModal.bookId || bookId}
        viewOnly={chapterFormModal.mode === 'view'}
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
