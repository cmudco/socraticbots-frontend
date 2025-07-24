import React from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

// interface ActionButton {
//   id: string;
//   label: string;
//   message: string;
//   icon?: React.ReactNode;
// }

interface ChatControlsProps {
  onActionClick: (message: string) => void;
  onClearConversation: () => void;
  disabled: boolean;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  // onActionClick,
  onClearConversation,
  disabled,
}) => {
  // const actionButtons: ActionButton[] = [
  //   {
  //     id: 'learning-goals',
  //     label: 'Learning Goals',
  //     message: 'What are the learning goals for this bot?',
  //   },
  //   {
  //     id: 'explain-topic',
  //     label: 'Explain Topic',
  //     message: 'Can you explain the main topic of this bot?',
  //   },
  //   {
  //     id: 'give-example',
  //     label: 'Give Example',
  //     message: 'Can you give me an example related to this topic?',
  //   },
  //   {
  //     id: 'quiz-me',
  //     label: 'Quiz Me',
  //     message: 'Can you quiz me on this material?',
  //   },
  // ];

  return (
    <div className="flex items-center justify-end">
      {/* <div className="flex flex-wrap items-center gap-2">
        {actionButtons.map(button => (
          <Button
            key={button.id}
            variant="outline"
            size="sm"
            onClick={() => onActionClick(button.message)}
            disabled={disabled}
            className="border-violet-200 bg-white text-sm text-violet-700 hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50"
            title={button.message}
          >
            {button.icon}
            {button.label}
          </Button>
        ))}
      </div> */}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearConversation}
        disabled={disabled}
        className="text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        title="Clear conversation"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clear
      </Button>
    </div>
  );
};

export default ChatControls;
