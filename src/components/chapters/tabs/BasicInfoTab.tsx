// src/components/chapters/tabs/BasicInfoTab.tsx
import React from 'react';
import { useChapterFormStore } from '../../../stores/chapterFormStore';
import { useModels, type Model } from '../../../hooks/queries/useModels';

const BasicInfoTab: React.FC = () => {
  // Get form data from Zustand store
  const {
    title,
    subject,
    topic,
    chat_model_id,
    tracking_model_id,
    touched,
    errors,
    updateField,
    setFieldTouched,
    validateField
  } = useChapterFormStore();

  // Use the models query hook
  const { data: availableModels = [], isLoading: modelsLoading } = useModels();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Update Zustand state with validation
    updateField(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Mark field as touched and validate it
    setFieldTouched(name, true);
    validateField(name, value);
  };

  // Get field error if field is touched
  const getFieldError = (fieldName: string): string | null => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : null;
  };

  // Helper function to get field styles with error state
  const getFieldStyles = (fieldName: string) => {
    const hasError = getFieldError(fieldName);
    return `w-full p-2 border rounded focus:ring-2 transition-colors ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
    }`;
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
          onBlur={handleBlur}
          className={getFieldStyles('title')}
          required
        />
        {getFieldError('title') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
        )}
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
          onBlur={handleBlur}
          className={getFieldStyles('subject')}
          required
        />
        {getFieldError('subject') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('subject')}</p>
        )}
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
          onBlur={handleBlur}
          className={getFieldStyles('topic')}
          required
        />
        {getFieldError('topic') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('topic')}</p>
        )}
      </div>

      {/* Model Dropdowns */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="chat_model_id">
          Chat Model
        </label>
        {modelsLoading ? (
          <div className="text-gray-500">Loading models...</div>
        ) : (
          <select
            id="chat_model_id"
            name="chat_model_id"
            value={chat_model_id || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldStyles('chat_model_id')}
          >
            <option value="">Select Chat Model</option>
            {availableModels.map((model: Model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        )}
        {getFieldError('chat_model_id') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('chat_model_id')}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="tracking_model_id">
          Progress Tracking Model
        </label>
        {modelsLoading ? (
          <div className="text-gray-500">Loading models...</div>
        ) : (
          <select
            id="tracking_model_id"
            name="tracking_model_id"
            value={tracking_model_id || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldStyles('tracking_model_id')}
          >
            <option value="">Select Progress Tracking Model</option>
            {availableModels.map((model: Model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        )}
        {getFieldError('tracking_model_id') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('tracking_model_id')}</p>
        )}
      </div>
    </div>
  );
};

export default BasicInfoTab;
