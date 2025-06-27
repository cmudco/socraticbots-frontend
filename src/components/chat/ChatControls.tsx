// src/components/chat/ChatControls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

// Define a type for our action buttons (excluding special ones like "Clear Conversation")
interface ActionButton {
  id: string;
  label: string;
  message: string; // Text to insert into the chat input
  icon?: React.ReactNode;
}

interface ChatControlsProps {
  onActionClick: (message: string) => void;
  onClearConversation: () => void;
  disabled: boolean;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  onActionClick,
  onClearConversation,
  disabled
}) => {
  // Define our preset action buttons - easy to add more or modify
  const actionButtons: ActionButton[] = [
    {
      id: 'learning-goals',
      label: 'Learning Goals',
      message: 'What are the learning goals for this chapter?'
    },
    {
      id: 'explain-topic',
      label: 'Explain Topic',
      message: 'Can you explain the main topic of this chapter?'
    },
    {
      id: 'give-example',
      label: 'Give Example',
      message: 'Can you give me an example related to this topic?'
    },
    {
      id: 'quiz-me',
      label: 'Quiz Me',
      message: 'Can you quiz me on this material?'
    }
  ];

  return (
    <div className="flex items-center justify-between">
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {actionButtons.map(button => (
          <Button
            key={button.id}
            variant="outline"
            size="sm"
            onClick={() => onActionClick(button.message)}
            disabled={disabled}
            className="text-sm bg-white border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 disabled:opacity-50"
            title={button.message}
          >
            {button.icon}
            {button.label}
          </Button>
        ))}
      </div>

      {/* Clear conversation button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearConversation}
        disabled={disabled}
        className="text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
        title="Clear conversation"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Clear
      </Button>
    </div>
  );
};

export default ChatControls;
