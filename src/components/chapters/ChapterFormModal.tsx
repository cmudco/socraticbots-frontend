// src/components/chapters/ChapterFormModal.tsx
import React, { useEffect } from 'react';
import { useChapterFormStore } from '../../stores/chapterFormStore';
import { useCreateChapter, useUpdateChapter } from '../../hooks/queries/useChapters';
import { Chapter } from '../../services/chapters.service';
import BasicInfoTab from './tabs/BasicInfoTab';
import PromptsTab from './tabs/PromptsTab';
import FilesTab from './tabs/FilesTab';
import DeploymentTab from './tabs/DeploymentTab';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, X } from 'lucide-react';

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
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-6 border-b">
              <TabsList className="grid w-full grid-cols-4 bg-slate-100">
                <TabsTrigger 
                  value="basic" 
                  className="data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger 
                  value="prompts"
                  className="data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm"
                >
                  Prompts & Models
                </TabsTrigger>
                <TabsTrigger 
                  value="files"
                  className="data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm"
                >
                  Files
                </TabsTrigger>
                <TabsTrigger 
                  value="deployment"
                  className="data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:shadow-sm"
                >
                  Deployment
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="basic" className="mt-0">
                <BasicInfoTab />
              </TabsContent>
              <TabsContent value="prompts" className="mt-0">
                <PromptsTab />
              </TabsContent>
              <TabsContent value="files" className="mt-0">
                <FilesTab />
              </TabsContent>
              <TabsContent value="deployment" className="mt-0">
                <DeploymentTab />
              </TabsContent>
            </div>
          </Tabs>
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