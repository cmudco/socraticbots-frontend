// src/components/chapters/ChapterFormModal.tsx
import React, { useRef, useEffect } from 'react';
import { useChapterFormStore } from '../../stores/chapterFormStore';
import { useCreateChapter, useUpdateChapter } from '../../hooks/queries/useChapters';
import { Chapter } from '../../services/chapters.service';
import BasicInfoTab from './tabs/BasicInfoTab';
import PromptsTab from './tabs/PromptsTab';
import FilesTab from './tabs/FilesTab';
import DeploymentTab from './tabs/DeploymentTab';

interface ChapterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: Chapter | null;
  bookId: string;
}

const ChapterFormModal: React.FC<ChapterFormModalProps> = ({
  isOpen,
  onClose,
  chapter,
  bookId
}) => {
  const chapterFormStore = useChapterFormStore();
  const createChapterMutation = useCreateChapter();
  const updateChapterMutation = useUpdateChapter();

  const {
    activeTab,
    isEdit,
    isSubmitting,
    title,
    subject,
    topic,
    greeting,
    chat_prompt,
    tracking_prompt,
    learning_goals,
    chat_model_id,
    tracking_model_id,
    setActiveTab,
    initEditChapter,
    initNewChapter,
    closeForm,
    setSubmitting,
    validateForm
  } = chapterFormStore;

  // Create a ref for the modal content
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Initialize form when modal opens/closes or chapter changes
  useEffect(() => {
    if (isOpen) {
      if (chapter) {
        initEditChapter(chapter);
      } else {
        initNewChapter();
      }
    }
  }, [chapter, isOpen, initEditChapter, initNewChapter]);

  const handleClose = React.useCallback(() => {
    closeForm();
    onClose();
  }, [closeForm, onClose]);

  const handleOutsideClick = React.useCallback((e: MouseEvent) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target as Node) &&
      !isSubmitting
    ) {
      handleClose();
    }
  }, [isSubmitting, handleClose]);

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
  }, [isOpen, handleOutsideClick]);

  const handleSubmit = React.useCallback(async () => {
    // Validate the form first
    const isValid = validateForm();
    if (!isValid) {
      console.log('Form validation failed');
      return;
    }

    // Set submitting state to true
    setSubmitting(true);

    try {
      const chapterData = {
        title,
        subject,
        topic,
        greeting,
        chat_prompt,
        tracking_prompt,
        learning_goals,
        chat_model_id,
        tracking_model_id,
      };

      if (isEdit && chapter) {
        // If editing, use update mutation
        await updateChapterMutation.mutateAsync({
          bookId,
          chapterId: chapter.id,
          chapterData: chapterData
        });
      } else {
        // If creating, use create mutation
        await createChapterMutation.mutateAsync({
          bookId,
          chapterData: chapterData
        });
      }

      // Close the modal after successful submission
      closeForm();
      onClose();
    } catch (error) {
      console.error('Error saving chapter:', error);
      // Error handling is managed by TanStack Query
    } finally {
      setSubmitting(false);
    }
  }, [
    validateForm,
    setSubmitting,
    title,
    subject,
    topic,
    greeting,
    chat_prompt,
    tracking_prompt,
    learning_goals,
    chat_model_id,
    tracking_model_id,
    isEdit,
    chapter,
    updateChapterMutation,
    createChapterMutation,
    bookId,
    closeForm,
    onClose
  ]);

  // Handle Ctrl+Enter for form submission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleSubmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalContentRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Chapter' : 'Create New Chapter'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'basic'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'prompts'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('prompts')}
          >
            Prompts & Models
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'files'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('files')}
          >
            Files
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'deployment'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('deployment')}
          >
            Deployment
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[500px]">
          {activeTab === 'basic' && (
            <BasicInfoTab />
          )}
          {activeTab === 'prompts' && (
            <PromptsTab />
          )}
          {activeTab === 'files' && (
            <FilesTab />
          )}
          {activeTab === 'deployment' && (
            <DeploymentTab />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Chapter' : 'Create Chapter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterFormModal;