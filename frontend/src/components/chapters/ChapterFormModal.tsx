// src/components/chapters/ChapterFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  const [formData, setFormData] = useState<CreateChapterRequest>({
    title: '',
    subject: '',
    topic: ''
  });
  
  const [modelPreferences, setModelPreferences] = useState<ChapterModelPreferenceRequest>({
    chat_model_id: undefined,
    tracking_model_id: undefined
  });
  
  // Add active tab state
  const [activeTab, setActiveTab] = useState('basic');
  
  // Create a ref for the modal content
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes or chapter changes
  useEffect(() => {
    if (chapter) {
      setFormData({
        title: chapter.title,
        subject: chapter.subject,
        topic: chapter.topic
      });
      
      // Set model preferences if they exist
      if (chapter.model_preference) {
        setModelPreferences({
          chat_model_id: chapter.model_preference.chat_model?.id,
          tracking_model_id: chapter.model_preference.tracking_model?.id
        });
      } else {
        setModelPreferences({
          chat_model_id: undefined,
          tracking_model_id: undefined
        });
      }
    } else {
      setFormData({
        title: '',
        subject: '',
        topic: ''
      });
      setModelPreferences({
        chat_model_id: undefined,
        tracking_model_id: undefined
      });
    }
    // Reset to first tab when opening modal
    setActiveTab('basic');
  }, [chapter, isOpen]);
  
  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop (not the modal content)
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log(`Field changed: ${field}, value: ${value}`);
    
    if (field === 'chat_model_id' || field === 'tracking_model_id' || field === 'progress_tracking_model_id') {
      // Handle the case for progress_tracking_model_id as well for backward compatibility
      const mappedField = field === 'progress_tracking_model_id' ? 'tracking_model_id' : field;
      
      setModelPreferences(prev => ({
        ...prev,
        [mappedField]: value || undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = () => {
    // Only include model preferences if at least one is set
    const hasModelPreferences = !!modelPreferences.chat_model_id || !!modelPreferences.tracking_model_id;
    
    console.log("Submitting model preferences:", modelPreferences);
    
    onSubmit(
      formData, 
      hasModelPreferences ? modelPreferences : undefined
    );
    onClose();
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
          {chapter ? 'Edit Chapter' : 'Create New Chapter'}
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
              onClick={() => setActiveTab('basic')}
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
              onClick={() => setActiveTab('prompts')}
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
              onClick={() => setActiveTab('goals')}
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
              onClick={() => setActiveTab('files')}
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
              onClick={() => setActiveTab('deployment')}
            >
              Deployment
            </button>
          </nav>
        </div>
        
        {/* Tab Content - Notice how I've changed this to have a scrollable content area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'basic' && (
              <BasicInfoTab 
                formData={{
                  ...formData,
                  chat_model_id: modelPreferences.chat_model_id,
                  tracking_model_id: modelPreferences.tracking_model_id
                }}
                onChange={handleChange}
                isEdit={!!chapter}
              />
            )}
            
            {activeTab === 'prompts' && (
              <PromptsTab />
            )}
            
            {activeTab === 'goals' && (
              <LearningGoalsTab />
            )}
            
            {activeTab === 'files' && (
              <FilesTab />
            )}
            
            {activeTab === 'deployment' && (
              <DeploymentTab />
            )}
          </div>
          
          {/* Fixed Footer with Save Button */}
          <div className="border-t mt-6 pt-4 flex justify-end">
            <button
              type="button"
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleSubmit}
            >
              {chapter ? 'Save Changes' : 'Create Chapter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterFormModal;
