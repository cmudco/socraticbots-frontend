// src/components/chapters/ChapterFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Chapter, CreateChapterRequest } from '../../services/chapters.service';
import BasicInfoTab from './tabs/BasicInfoTab';
import PromptsTab from './tabs/PromptsTab';
import LearningGoalsTab from './tabs/LearningGoalsTab';
import FilesTab from './tabs/FilesTab';
import DeploymentTab from './tabs/DeploymentTab';

interface ChapterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChapterRequest) => void;
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
    } else {
      setFormData({
        title: '',
        subject: '',
        topic: ''
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalContentRef}
        className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        // Stop propagation to prevent closing when clicking on the modal content
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
        
        {/* Tab Content */}
        {activeTab === 'basic' && (
          <BasicInfoTab 
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={onClose}
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
    </div>
  );
};

export default ChapterFormModal;
