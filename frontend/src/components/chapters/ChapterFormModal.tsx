// src/components/chapters/ChapterFormModal.tsx
import React, { useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  setActiveTab, 
  closeForm, 
  initNewChapter, 
  initEditChapter,
  setSubmitting
} from '../../store/slices/chapterFormSlice';
import { createChapter, updateChapter } from '../../store/thunks/chapterThunks';
import { Chapter } from '../../services/chapters.service';
import BasicInfoTab from './tabs/BasicInfoTab';
import PromptsTab from './tabs/PromptsTab';
import LearningGoalsTab from './tabs/LearningGoalsTab';
import FilesTab from './tabs/FilesTab';
import DeploymentTab from './tabs/DeploymentTab';

interface ChapterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: Chapter | null;
  bookId: string; // Added bookId for API calls
}

const ChapterFormModal: React.FC<ChapterFormModalProps> = ({
  isOpen,
  onClose,
  chapter,
  bookId
}) => {
  const dispatch = useAppDispatch();
  const { 
    activeTab, 
    isEdit,
    isSubmitting,
    title,
    subject,
    topic
  } = useAppSelector(state => state.chapterForm);
  
  // Create a ref for the modal content
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Initialize form when modal opens/closes or chapter changes
  useEffect(() => {
    if (isOpen) {
      if (chapter) {
        dispatch(initEditChapter(chapter));
      } else {
        dispatch(initNewChapter());
      }
    }
  }, [chapter, isOpen, dispatch]);
  
  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop (not the modal content)
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
      dispatch(closeForm());
    }
  };


  const handleSubmit = async () => {
    // Set submitting state to true
    dispatch(setSubmitting(true));
    
    try {
      if (isEdit && chapter) {
        // If editing, dispatch update thunk
        await dispatch(updateChapter({ 
          bookId, 
          chapterId: chapter.id 
        })).unwrap(); // unwrap to get the result or throw error
      } else {
        // If creating, dispatch create thunk
        await dispatch(createChapter({ bookId })).unwrap();
      }
      
      // Close the modal after successful submission
      onClose();
      dispatch(closeForm());
    } catch (error) {
      console.error('Error saving chapter:', error);
      // You could display an error message here
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  // Form validation
  const isFormValid = () => {
    return title.trim() !== '' && subject.trim() !== '' && topic.trim() !== '';
  };

  // Handle Ctrl+Enter for form submission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && isFormValid() && !isSubmitting) {
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFormValid, isSubmitting, handleSubmit]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalContentRef}
        className="bg-white rounded-lg p-6 w-full max-w-4xl h-[650px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? 'Edit Chapter' : 'Create New Chapter'}
        </h2>
        
        {/* Tab Navigation */}
        <div className="border-b mb-6">
          <nav className="flex -mb-px">
            <button
              type="button"
              className={`mr-4 py-2 px-4 ${
                activeTab === 'basic'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => dispatch(setActiveTab('basic'))}
            >
              Basic Info
            </button>
            
            <button
              type="button"
              className={`mr-4 py-2 px-4 ${
                activeTab === 'prompts'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => dispatch(setActiveTab('prompts'))}
            >
              Prompts
            </button>

            {/* 
            <button
              type="button"
              className={`mr-4 py-2 px-4 relative ${
                activeTab === 'goals'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              } ${!isEdit ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
              onClick={() => isEdit && dispatch(setActiveTab('goals'))}
              disabled={!isEdit}
              title={!isEdit ? "Save the chapter first to add learning goals" : ""}
            >
              Learning Goals
              {!isEdit && (
                <>
                  <div className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-gray-200 bg-opacity-40">
                    Save first
                  </span>
                </>
              )}
              
            </button>
            */}
            
            <button
              type="button"
              className={`mr-4 py-2 px-4 ${
                activeTab === 'files'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => dispatch(setActiveTab('files'))}
            >
              Files
            </button>
            
            <button
              type="button"
              className={`mr-4 py-2 px-4 ${
                activeTab === 'deployment'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => dispatch(setActiveTab('deployment'))}
            >
              Deployment
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'basic' && <BasicInfoTab />}
            
            {activeTab === 'prompts' && <PromptsTab />}
            
            {/*
            {activeTab === 'goals' && <LearningGoalsTab />}
            */}
            
            {activeTab === 'files' && <FilesTab />}
            
            {activeTab === 'deployment' && <DeploymentTab />}
          </div>
          
          {/* Fixed Footer with Save Button */}
          <div className="border-t mt-6 pt-4 flex justify-end space-x-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={() => {
                onClose();
                dispatch(closeForm());
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="button"
              className={`px-3 py-1.5 text-sm rounded ${
                isFormValid() 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-blue-300 text-white cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span> : 
                (isEdit ? 'Save Changes' : 'Create Chapter')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterFormModal;
