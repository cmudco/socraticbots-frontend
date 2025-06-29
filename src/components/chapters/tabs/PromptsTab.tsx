// src/components/chapters/tabs/PromptsTab.tsx
import React from 'react';

import Placeholder from '@tiptap/extension-placeholder';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { useChapterFormStore } from '../../../stores/chapterFormStore';

// Simplified menu bar with only bold and italic
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 border-b bg-gray-50 p-2">
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded p-1.5 transition-colors ${
          editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Bold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded p-1.5 transition-colors ${
          editor.isActive('italic')
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Italic"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>
    </div>
  );
};

// Clean, minimal editor component with only essential formatting
const TiptapEditor = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) => {
  // Create a custom starter kit without the list extensions
  const CustomStarterKit = StarterKit.configure({
    // Disable list-related extensions
    bulletList: false,
    orderedList: false,
    listItem: false,

    // You can disable other unused extensions as well
    heading: false,
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
  });

  const editor = useEditor({
    extensions: [
      CustomStarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'p-4 min-h-[160px] focus:outline-none',
      },
    },
  });

  return (
    <div className="overflow-hidden rounded border bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

const PromptsTab: React.FC = () => {
  const { greeting, chat_prompt, tracking_prompt, learning_goals, updateField } =
    useChapterFormStore();

  // Handler to update greeting in Zustand
  const handleGreetingChange = (html: string) => {
    updateField('greeting', html);
  };

  // Handler to update chat prompt in Zustand
  const handleChatPromptChange = (html: string) => {
    updateField('chat_prompt', html);
  };

  // Handler to update tracking prompt in Zustand
  const handleTrackingPromptChange = (html: string) => {
    updateField('tracking_prompt', html);
  };

  const handleLearningGoalsChange = (html: string) => {
    updateField('learning_goals', html);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-2 text-lg font-medium">Greeting</h3>
        <p className="mb-2 text-sm text-gray-600">
          This is the initial greeting message shown to the student when they start the chapter.
        </p>
        <TiptapEditor
          value={greeting}
          onChange={handleGreetingChange}
          placeholder="Enter the greeting message for students..."
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-medium">Chat Prompt</h3>
        <p className="mb-2 text-sm text-gray-600">
          This prompt guides the AI in how to respond to student messages during the chapter.
        </p>
        <TiptapEditor
          value={chat_prompt}
          onChange={handleChatPromptChange}
          placeholder="Enter instructions for the AI on how to respond to student messages..."
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-medium">Tracking Prompt</h3>
        <p className="mb-2 text-sm text-gray-600">
          This prompt guides the AI in tracking student progress and understanding.
        </p>
        <TiptapEditor
          value={tracking_prompt}
          onChange={handleTrackingPromptChange}
          placeholder="Enter instructions for the AI on how to track student progress..."
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-medium">Learning Goals</h3>
        <p className="mb-2 text-sm text-gray-600">
          Define the learning goals for this chapter. The more structure you are able to provide the
          better the AI will be able to help students achieve their goals.
        </p>
        <TiptapEditor
          value={learning_goals}
          onChange={handleLearningGoalsChange}
          placeholder="Enter the learning goals for this chapter, e.g., 'Understand photosynthesis, Describe the carbon cycle...'"
        />
      </div>
    </div>
  );
};

export default PromptsTab;
