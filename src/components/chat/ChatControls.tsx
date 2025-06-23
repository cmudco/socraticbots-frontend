// src/components/chat/ChatControls.tsx
import React from 'react';

// Define a type for our action buttons (excluding special ones like "Clear Conversation")
interface ActionButton {
  id: string;
  label: string;
  message: string; // Text to insert into the chat input
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
    /** 
    {
      id: 'learning-goals',
      label: 'Learning Goals',
      message: 'What are the learning goals for this chapter?'
    },
    // Easy to add more action buttons here
    {
      id: 'explain-topic',
      label: 'Explain Topic',
      message: 'Can you explain the main topic of this chapter?'
    },
    {
      id: 'give-example',
      label: 'Give Example',
      message: 'Can you give me an example related to this topic?'
    }
    */
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {/* Map through the action buttons */}
      {actionButtons.map(button => (
        <button
          key={button.id}
          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors"
          onClick={() => onActionClick(button.message)}
          disabled={disabled}
          title={button.message}
        >
          {button.label}
        </button>
      ))}
      
      {/* Clear conversation button - styled differently */}
      <button
        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors ml-auto"
        onClick={onClearConversation}
        disabled={disabled}
      >
        Clear Conversation
      </button>
    </div>
  );
};

export default ChatControls;
