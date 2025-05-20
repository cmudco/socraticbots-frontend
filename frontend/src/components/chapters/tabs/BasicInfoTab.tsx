// src/components/chapters/tabs/BasicInfoTab.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setField } from '../../../store/slices/chapterFormSlice';
import { fetchModels } from '../../../store/thunks/chapterFormThunks';

const BasicInfoTab: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Get form data from Redux store
  const { 
    title, 
    subject, 
    topic, 
    chat_model_id, 
    tracking_model_id, 
    availableModels, 
    modelsLoading,
    isEdit
  } = useAppSelector(state => state.chapterForm);
  
  // Not used.
  if (false) {console.log(isEdit);}


  // Fetch models when component mounts
  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    dispatch(setField({ field: name, value }));
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
          value={title}
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
          value={subject}
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
          value={topic}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      {/* Model Dropdowns */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="chat_model_id">
          Agent Model
        </label>
        {modelsLoading ? (
          <div className="text-gray-500">Loading models...</div>
        ) : (
          <select
            id="chat_model_id"
            name="chat_model_id"
            value={chat_model_id || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Chat Model</option>
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="tracking_model_id">
          Helper Model
        </label>
        {modelsLoading ? (
          <div className="text-gray-500">Loading models...</div>
        ) : (
          <select
            id="tracking_model_id"
            name="tracking_model_id"
            value={tracking_model_id || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Progress Tracking Model</option>
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default BasicInfoTab;
