// src/components/chapters/ChapterFormModal.tsx
import React, { useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  setActiveTab, 
  closeForm, 
  initNewChapter, 
  initEditChapter 
} from '../../store/slices/chapterFormSlice';
import { Chapter, CreateChapterRequest, ChapterModelPreferenceRequest } from '../../services/chapters.service';
import BasicInfoTab from './tabs/BasicInfoTab';
import PromptsTab from './tabs/PromptsTab';
import LearningGoalsTab from './tabs/LearningGoalsTab';
import FilesTab from './tabs/FilesTab';
import DeploymentTab from './tabs/DeploymentTab';

interface ChapterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChapterRequest, modelPreferences?: ChapterModelPreferenceRequest) => void;
  chapter?: Chapter | null;
}

const ChapterFormModal: React.FC<ChapterFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  chapter
}) => {
  const dispatch = useAppDispatch();
  const { 
    activeTab, 
    title, 
    subject, 
    topic, 
    chat_model_id, 
    tracking_model_id,
    isEdit
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

  const handleSubmit = () => {
    const formData: CreateChapterRequest = {
      title,
      subject,
      topic
    };
    
    // Only include model preferences if at least one is set
    const hasModelPreferences = !!chat_model_id || !!tracking_model_id;
    const modelPreferences = hasModelPreferences ? {
      chat_model_id,
      tracking_model_id
    } : undefined;
    
    console.log("Submitting form data:", formData);
    console.log("Submitting model preferences:", modelPreferences);
    
    onSubmit(formData, modelPreferences);
    onClose();
    dispatch(closeForm());
  };

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
            
            <button
              type="button"
              className={`mr-4 py-2 px-4 ${
                activeTab === 'goals'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => dispatch(setActiveTab('goals'))}
            >
              Learning Goals
            </button>
            
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
        
        {/* Tab Content - Notice how I've changed this to have a scrollable content area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'basic' && <BasicInfoTab />}
            
            {activeTab === 'prompts' && <PromptsTab />}
            
            {activeTab === 'goals' && <LearningGoalsTab />}
            
            {activeTab === 'files' && <FilesTab />}
            
            {activeTab === 'deployment' && <DeploymentTab />}
          </div>
          
          {/* Fixed Footer with Save Button */}
          <div className="border-t mt-6 pt-4 flex justify-end">
            <button
              type="button"
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleSubmit}
            >
              {isEdit ? 'Save Changes' : 'Create Chapter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterFormModal;
