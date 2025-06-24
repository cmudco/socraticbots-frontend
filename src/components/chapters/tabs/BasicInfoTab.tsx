// src/components/chapters/tabs/BasicInfoTab.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setField } from '../../../store/slices/chapterFormSlice';
import { fetchModels } from '../../../store/thunks/chapterFormThunks';
import { FormikProps } from 'formik';

interface BasicInfoTabProps {
  formik: FormikProps<any>;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formik }) => {
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
    // Update Redux state
    dispatch(setField({ field: name, value }));
    // Update Formik value without touching
    formik.setFieldValue(name, value, false); // false prevents validation
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    // Set field as touched when user leaves the field
    formik.setFieldTouched(name, true);
  };

  // Helper function to get field error
  const getFieldError = (fieldName: string): string | null => {
    const error = formik.errors[fieldName];
    const touched = formik.touched[fieldName];
    if (error && touched && typeof error === 'string') {
      return error;
    }
    return null;
  };

  // Helper function to get field styles
  const getFieldStyles = (fieldName: string) => {
    const hasError = formik.errors[fieldName] && formik.touched[fieldName];
    return `w-full p-2 border rounded transition-colors ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
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
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.provider})
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
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.provider})
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
