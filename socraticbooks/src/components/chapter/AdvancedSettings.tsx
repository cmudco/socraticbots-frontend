import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface AdvancedSettingsProps {
  advancedFields: {
    greeting: string;
    teaching_style: string;
    qa_instructions: string;
    restrictions: string;
    progress_tracker: string;
  };
  onFieldChange: (field: string, value: string) => void;
  chapterId: string;
}

// Place API key here
const TINY_MCE_KEY = '3dorlo24gifjzu0ggckuuopsfagwx41i2vac1ox51mcebq87';

// Common editor settings
const EDITOR_CONFIG = {
  height: 200,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | formatselect | ' +
    'bold italic backcolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
};

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  advancedFields,
  onFieldChange,
  chapterId,
}) => {

    // Placeholder to remove chapterId non-use warning
    if (false) {
      console.log(chapterId);
    }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Greeting
        </label>
        <Editor
          apiKey={TINY_MCE_KEY}
          value={advancedFields.greeting}
          onEditorChange={(content) => onFieldChange('greeting', content)}
          init={EDITOR_CONFIG}
        />
      </div>

      {/* Teaching Style */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Teaching Style
        </label>
        <Editor
          apiKey={TINY_MCE_KEY}
          value={advancedFields.teaching_style}
          onEditorChange={(content) => onFieldChange('teaching_style', content)}
          init={EDITOR_CONFIG}
        />
      </div>

      {/* QA Instructions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          QA Instructions
        </label>
        <Editor
          apiKey={TINY_MCE_KEY}
          value={advancedFields.qa_instructions}
          onEditorChange={(content) => onFieldChange('qa_instructions', content)}
          init={EDITOR_CONFIG}
        />
      </div>

      {/* Restrictions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Restrictions
        </label>
        <Editor
          apiKey={TINY_MCE_KEY}
          value={advancedFields.restrictions}
          onEditorChange={(content) => onFieldChange('restrictions', content)}
          init={EDITOR_CONFIG}
        />
      </div>

      {/* Progress Tracker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Progress Tracker
        </label>
        <Editor
          apiKey={TINY_MCE_KEY}
          value={advancedFields.progress_tracker}
          onEditorChange={(content) => onFieldChange('progress_tracker', content)}
          init={EDITOR_CONFIG}
        />
      </div>
    </div>
  );
};

export default AdvancedSettings;
