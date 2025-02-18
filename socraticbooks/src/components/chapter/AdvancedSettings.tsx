import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface AdvancedSettingsProps {
  advancedFields: {
    greeting: string;
    teaching_style: string;
    qa_instructions: string;
    restrictions: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

const TOOLBAR_OPTIONS = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['clean']
  ]
};

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  advancedFields,
  onFieldChange,
}) => {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Greeting
        </label>
        <div className="border rounded-lg overflow-hidden">
          <ReactQuill
            theme="snow"
            value={advancedFields.greeting}
            onChange={(content) => onFieldChange('greeting', content)}
            modules={TOOLBAR_OPTIONS}
            className="h-[200px] mb-12" // Extra padding for toolbar
          />
        </div>
      </div>

      {/* Teaching Style */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Teaching Style
        </label>
        <div className="border rounded-lg overflow-hidden">
          <ReactQuill
            theme="snow"
            value={advancedFields.teaching_style}
            onChange={(content) => onFieldChange('teaching_style', content)}
            modules={TOOLBAR_OPTIONS}
            className="h-[200px] mb-12"
          />
        </div>
      </div>

      {/* QA Instructions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          QA Instructions
        </label>
        <div className="border rounded-lg overflow-hidden">
          <ReactQuill
            theme="snow"
            value={advancedFields.qa_instructions}
            onChange={(content) => onFieldChange('qa_instructions', content)}
            modules={TOOLBAR_OPTIONS}
            className="h-[200px] mb-12"
          />
        </div>
      </div>

      {/* Restrictions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Restrictions
        </label>
        <div className="border rounded-lg overflow-hidden">
          <ReactQuill
            theme="snow"
            value={advancedFields.restrictions}
            onChange={(content) => onFieldChange('restrictions', content)}
            modules={TOOLBAR_OPTIONS}
            className="h-[200px] mb-12"
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;
