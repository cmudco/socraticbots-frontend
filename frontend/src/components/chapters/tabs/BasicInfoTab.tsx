// src/components/chapters/tabs/BasicInfoTab.tsx
import React, { useState, useEffect } from 'react';
import { CreateChapterRequest } from '../../../services/chapters.service';
import { modelsService, AIModel } from '../../../services/models.service';

interface BasicInfoTabProps {
  formData: CreateChapterRequest & { 
    chat_model_id?: string;
    tracking_model_id?: string;
  };
  onChange: (field: string, value: string) => void;
  isEdit: boolean;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  onChange,
  isEdit
}) => {
  // Models state
  const [models, setModels] = useState<AIModel[]>([]);
  
  useEffect(() => {
    modelsService.getModels().then(data => {
      setModels(data);
      
      // Only set default values if this is not edit mode and no models are selected
      if (!isEdit && (!formData.chat_model_id || !formData.tracking_model_id)) {
        // Find Claude 3.7 Sonnet (Latest) for chat
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
          onChange('tracking_model_id', defaultProgressModel.id);
        }
      }
    }).catch(err => {
      console.error('Error loading models:', err);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div>
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
        <label className="block text-gray-700 mb-1" htmlFor="tracking_model_id">
          Progress Tracking Model
        </label>
        <select
          id="tracking_model_id"
          name="tracking_model_id"
          value={(formData as any).tracking_model_id || ''}
          onChange={handleChange}
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
    </div>
  );
};

export default BasicInfoTab;
