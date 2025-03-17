// src/components/chapters/ChapterList.tsx
import React, { useState } from 'react';
import { Chapter, CreateChapterRequest, ChapterModelPreferenceRequest,UpdateChapterRequest } from '../../services/chapters.service';
import { chapterService } from '../../services/chapters.service';
import ChapterItem from './ChapterItem';
import ChapterFormModal from './ChapterFormModal';

interface ChapterListProps {
  bookId: string;
  chapters: Chapter[];
  onChapterAdded: (chapter: Chapter) => void;
  onChapterUpdated: (chapter: Chapter) => void;
  onChapterDeleted: (chapterId: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ 
  bookId, 
  chapters, 
  onChapterAdded,
  onChapterUpdated,
  onChapterDeleted
}) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

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

  const handleCreateChapter = async (
    chapterData: CreateChapterRequest, 
    modelPreferences?: ChapterModelPreferenceRequest
  ) => {
    try {
      const newChapter = await chapterService.createChapter(bookId, chapterData, modelPreferences);
      onChapterAdded(newChapter);
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const handleUpdateChapter = async (
    chapterId: string, 
    chapterData: UpdateChapterRequest,
    modelPreferences?: ChapterModelPreferenceRequest
  ) => {
    try {
      const updatedChapter = await chapterService.updateChapter(
        bookId, 
        chapterId, 
        chapterData, 
        modelPreferences
      );
      onChapterUpdated(updatedChapter);
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      try {
        await chapterService.deleteChapter(bookId, chapterId);
        onChapterDeleted(chapterId);
      } catch (error) {
        console.error('Error deleting chapter:', error);
      }
    }
  };

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

      {chapters.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No chapters yet. Add your first chapter!</p>
      ) : (
        <div className="space-y-2">
          {chapters.map(chapter => (
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
        onSubmit={selectedChapter 
          ? (data, modelPreferences) => handleUpdateChapter(selectedChapter.id, data, modelPreferences) 
          : handleCreateChapter
        }
        chapter={selectedChapter}
      />
    </div>
  );
};

export default ChapterList;
