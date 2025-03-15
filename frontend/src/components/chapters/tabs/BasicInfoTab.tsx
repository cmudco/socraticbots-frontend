// src/components/chapters/tabs/BasicInfoTab.tsx
import React, { useRef, useState, useEffect } from 'react';
import { CreateChapterRequest } from '../../../services/chapters.service';
import { modelsService, AIModel } from '../../../services/models.service';

interface BasicInfoTabProps {
  formData: CreateChapterRequest & { 
    chat_model_id?: string;
    progress_tracking_model_id?: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit: boolean;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEdit
}) => {
  // Track the currently focused field's initial value
  const fieldInitialValue = useRef<string>('');
  // Track the active field name
  const activeField = useRef<string | null>(null);
  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  // Track last save time for status message
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Models state
  const [models, setModels] = useState<AIModel[]>([]);
  
  useEffect(() => {
    modelsService.getModels().then(data => {
      setModels(data);
      
      // Only set default values if this is not edit mode and no models are selected
      if (!isEdit && (!formData.chat_model_id || !formData.progress_tracking_model_id)) {
        // Find Claude 3.5 Haiku (Latest) for chat
        const defaultChatModel = data.find(model => 
          model.name.includes("Claude 3.7 Sonnet") && model.name.includes("Latest"));
        
        // Find Claude 3.7 Sonnet (Latest) for progress tracking
        const defaultProgressModel = data.find(model => 
          model.name.includes("Claude 3.7 Sonnet") && model.name.includes("Latest"));
        
        // Set defaults if found
        if (defaultChatModel) {
          onChange('chat_model_id', defaultChatModel.id);
        }
        
        if (defaultProgressModel) {
          onChange('progress_tracking_model_id', defaultProgressModel.id);
        }
      }
    }).catch(err => {
      console.error('Error loading models:', err);
    });
  }, []);


  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Store the field's initial value when it gains focus
    const { name, value } = e.target;
    fieldInitialValue.current = value;
    activeField.current = name;
    setHasChanges(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
    
    // Check if this change is different from initial value
    if (name === activeField.current && value !== fieldInitialValue.current) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  };

  const handleBlur = () => {

    if (!isEdit && (!formData.title || !formData.subject || !formData.topic)) {
      setHasChanges(false);
      return; // Don't autosave yet
    }

    // Only submit if there were changes in the field that is being left
    if (hasChanges) {
      onSubmit(); // This auto-saves but doesn't close modal
      setHasChanges(false);
      setLastSaved(new Date());
    }
    activeField.current = null;
  };

  // Prevent form submission from causing issues
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  
  // Status indicator
  const renderStatus = () => {
    // For new chapters, show what fields are still required for autosave
    if (!isEdit && (!formData.title || !formData.subject || !formData.topic)) {
      const missingFields = [];
      if (!formData.title) missingFields.push('Title');
      if (!formData.subject) missingFields.push('Subject');
      if (!formData.topic) missingFields.push('Topic');
      
      return (
        <p className="text-amber-500 text-sm mt-2">
          Fill in {missingFields.join(', ')} {missingFields.length === 1 ? 'field' : 'fields'} to enable autosave
        </p>
      );
    }
    
    // Existing status messages
    if (hasChanges) {
      return <p className="text-blue-500 text-sm mt-2">Changes will save when you tab out</p>;
    }
    if (lastSaved) {
      const timeString = lastSaved.toLocaleTimeString();
      return <p className="text-green-500 text-sm mt-2">Last saved at {timeString}</p>;
    }
    
    // Default message for new chapters with all required fields
    if (!isEdit && formData.title && formData.subject && formData.topic && !lastSaved) {
      return <p className="text-blue-500 text-sm mt-2">Ready to autosave</p>;
    }
    
    return null;
  };


  return (
    <form onSubmit={handleSubmit}>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="title">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="subject">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="topic">
          Topic
        </label>
        <input
          type="text"
          id="topic"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      {/* Model Dropdowns */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="chat_model_id">
          Chat Model
        </label>
        <select
          id="chat_model_id"
          name="chat_model_id"
          value={(formData as any).chat_model_id || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Chat Model</option>
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.provider})
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="progress_tracking_model_id">
          Progress Tracking Model
        </label>
        <select
          id="progress_tracking_model_id"
          name="progress_tracking_model_id"
          value={(formData as any).progress_tracking_model_id || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur} 
          className="w-full p-2 border rounded"
        >
          <option value="">Select Progress Tracking Model</option>
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.provider})
            </option>
          ))}
        </select>
      </div>
      
      {/* Status indicator */}
      <div className="mt-4 text-right">
        {renderStatus()}
      </div>
      

    </form>
  );
};

export default BasicInfoTab;
