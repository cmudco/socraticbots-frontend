// src/components/chapters/ChapterFormModal.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { BookOpen } from 'lucide-react';
import { useChapterFormStore } from '../../stores/chapterFormStore';
import { useCreateChapter, useUpdateChapter } from '../../hooks/queries/useChapters';
import BasicInfoTab from './tabs/BasicInfoTab';
import PromptsTab from './tabs/PromptsTab';
import FilesTab from './tabs/FilesTab';
import DeploymentTab from './tabs/DeploymentTab';
import { FormikProps } from 'formik';
import { Chapter } from '@/services/chapters.service';

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
  bookId
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
    initNewChapter
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
        promptData
      });

      if (isEdit && chapter) {
        // If editing, use update mutation with separate calls
        await updateChapterMutation.mutateAsync({
          bookId,
          chapterId: chapter.id,
          chapterData,
          modelPreferences,
          promptData
        });
      } else {
        // If creating, use create mutation with separate calls
        await createChapterMutation.mutateAsync({
          bookId,
          chapterData,
          modelPreferences,
          promptData
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
    setSubmitting
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
    { id: 'files', label: 'Files' },
    { id: 'deployment', label: 'Deployment' }
  ];

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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {isEdit ? 'Edit Chapter' : 'Create New Chapter'}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {isEdit ? 'Update the chapter details below.' : 'Fill in the details to create a new chapter.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Custom Tab Navigation */}
          <div className="px-6 border-b flex-shrink-0">
            <div className="flex bg-slate-100 rounded-md p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-sm transition-all ${
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
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="flex items-center justify-end space-x-3 p-6 border-t">
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
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              isEdit ? 'Update Chapter' : 'Create Chapter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterFormModal;