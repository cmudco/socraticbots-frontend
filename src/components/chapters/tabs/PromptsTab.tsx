import React from 'react';

import Placeholder from '@tiptap/extension-placeholder';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { useChapterFormStore } from '@/stores/forms/chapterFormStore';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 border-b bg-gray-50 p-2">
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

const TiptapEditor = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) => {
  const CustomStarterKit = StarterKit.configure({
    bulletList: false,
    orderedList: false,
    listItem: false,

    heading: false,
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
  });

  const editor = useEditor({
    extensions: [
      CustomStarterKit,
      Placeholder.configure({
        placeholder: readOnly ? undefined : placeholder || 'Start writing...',
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: readOnly
      ? undefined
      : ({ editor }) => {
          onChange(editor.getHTML());
        },
    editorProps: {
      attributes: {
        class: `p-4 min-h-[160px] focus:outline-none ${readOnly ? 'bg-gray-50' : ''}`,
      },
    },
  });

  return (
    <div className="overflow-hidden rounded border bg-white">
      {!readOnly && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};

interface PromptsTabProps {
  viewOnly?: boolean;
}

const PromptsTab: React.FC<PromptsTabProps> = ({ viewOnly = false }) => {
  const { greeting, chat_prompt, tracking_prompt, learning_goals, updateField } =
    useChapterFormStore();

  const handleGreetingChange = (html: string) => {
    updateField('greeting', html);
  };

  const handleChatPromptChange = (html: string) => {
    updateField('chat_prompt', html);
  };

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
          This is the initial greeting message shown to the student when they start the bot.
        </p>
        <TiptapEditor
          value={greeting}
          onChange={handleGreetingChange}
          placeholder="Enter the greeting message for students..."
          readOnly={viewOnly}
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-medium">Chat Prompt</h3>
        <p className="mb-2 text-sm text-gray-600">
          This prompt guides the AI in how to respond to student messages during the bot.
        </p>
        <TiptapEditor
          value={chat_prompt}
          onChange={handleChatPromptChange}
          placeholder="Enter instructions for the AI on how to respond to student messages..."
          readOnly={viewOnly}
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
          readOnly={viewOnly}
        />
      </div>

      <div>
        <h3 className="mb-2 text-lg font-medium">Learning Goals</h3>
        <p className="text-sm text-gray-600">
          Define the learning goals for this bot. The more structure you are able to provide the
          better the AI will be at tracking student progress.
        </p>
        <TiptapEditor
          value={learning_goals}
          onChange={handleLearningGoalsChange}
          placeholder="Enter the learning goals for this bot, e.g., 'Understand photosynthesis, Describe the carbon cycle...'"
          readOnly={viewOnly}
        />
      </div>
    </div>
  );
};

export default PromptsTab;
