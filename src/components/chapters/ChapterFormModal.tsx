// src/components/chapters/ChapterFormModal.tsx
import React, { useCallback, useEffect, useRef } from 'react';

import { FormikProps } from 'formik';
import { BookOpen, Info } from 'lucide-react';

import { Chapter } from '@/services/chapters.service';

import { useCreateChapter, useUpdateChapter } from '../../hooks/queries/useChapters';
import { useChapterFormStore } from '../../stores/chapterFormStore';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import BasicInfoTab from './tabs/BasicInfoTab';
import DeploymentTab from './tabs/DeploymentTab';
import FilesTab from './tabs/FilesTab';
import PromptsTab from './tabs/PromptsTab';

interface ChapterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: Chapter | null;
  bookId: string;
}

interface FormValues {
  title: string;
  subject: string;
  topic: string;
  chat_model_id: string;
  tracking_model_id: string;
}

const ChapterFormModal: React.FC<ChapterFormModalProps> = ({
  isOpen,
  onClose,
  chapter,
  bookId,
}) => {
  const formRef = useRef<FormikProps<FormValues>>(null);

  const {
    activeTab,
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
    closeForm,
    setSubmitting,
    initEditChapter,
    initNewChapter,
  } = useChapterFormStore();

  const createChapterMutation = useCreateChapter();
  const updateChapterMutation = useUpdateChapter();

  const isEdit = !!chapter;

  // Reset form when modal opens/closes or chapter changes
  useEffect(() => {
    if (isOpen) {
      if (chapter) {
        // Populate form with existing chapter data
        initEditChapter(chapter);
      } else {
        // Reset form for new chapter
        initNewChapter();
      }
    }
  }, [isOpen, chapter, initEditChapter, initNewChapter]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      closeForm();
      onClose();
    }
  }, [isSubmitting, closeForm, onClose]);

  const handleSubmit = useCallback(async () => {
    // Trigger Formik validation first
    if (formRef.current) {
      const errors = await formRef.current.validateForm();
      if (Object.keys(errors).length > 0) {
        console.log('Validation errors:', errors);
        // Mark all fields as touched to show errors
        formRef.current.setTouched(
          Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        return; // Don't submit if there are validation errors
      }
    }

    console.log('Basic validation passed, proceeding with submission...');

    // Set submitting state to true
    setSubmitting(true);

    try {
      // Basic chapter data
      const chapterData = {
        title,
        subject,
        topic,
      };

      // Model preferences data
      const modelPreferences = {
        chat_model_id: chat_model_id || undefined,
        tracking_model_id: tracking_model_id || undefined,
      };

      // Prompts data
      const promptData = {
        greeting: greeting || undefined,
        chat_prompt: chat_prompt || undefined,
        tracking_prompt: tracking_prompt || undefined,
        learning_goals: learning_goals || undefined,
      };

      console.log('Submitting chapter data:', {
        chapterData,
        modelPreferences,
        promptData,
      });

      if (isEdit && chapter) {
        // If editing, use update mutation with separate calls
        await updateChapterMutation.mutateAsync({
          bookId,
          chapterId: chapter.id,
          chapterData,
          modelPreferences,
          promptData,
        });
      } else {
        // If creating, use create mutation with separate calls
        await createChapterMutation.mutateAsync({
          bookId,
          chapterData,
          modelPreferences,
          promptData,
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
    onClose,
    setSubmitting,
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

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'prompts', label: 'Prompts' },
    ...(isEdit ? [{ id: 'files', label: 'Files' }] : []),
    { id: 'deployment', label: 'Deployment' },
  ];

  // Reset to basic tab if we're on files tab but switched to create mode
  useEffect(() => {
    if (!isEdit && activeTab === 'files') {
      setActiveTab('basic');
    }
  }, [isEdit, activeTab, setActiveTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfoTab ref={formRef} />;
      case 'prompts':
        return <PromptsTab />;
      case 'files':
        return <FilesTab />;
      case 'deployment':
        return <DeploymentTab />;
      default:
        return <BasicInfoTab ref={formRef} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
              <BookOpen className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? 'Edit Chapter' : 'Create New Chapter'}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {isEdit
                  ? 'Update the chapter details below.'
                  : 'Fill in the details to create a new chapter.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Information banner for chapter creation */}
        {!isEdit && (
          <div className="mx-6 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="mt-0.5 flex-shrink-0 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">File Upload Available After Creation</p>
                <p className="mt-1 text-blue-700">
                  Once your chapter is created, you'll be able to upload files and documents in the
                  Files tab when editing the chapter.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Custom Tab Navigation */}
          <div className="flex-shrink-0 border-b px-6">
            <div className="flex rounded-md bg-slate-100 p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-violet-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">{renderTabContent()}</div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="flex items-center justify-end space-x-3 border-t p-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </div>
            ) : isEdit ? (
              'Update Chapter'
            ) : (
              'Create Chapter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterFormModal;
