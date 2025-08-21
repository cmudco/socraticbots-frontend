import React from 'react';

import { FileText } from 'lucide-react';

import ItemActions from '@/components/widgets/actions/ItemActions';

import { Bot } from '@/types/bot';

interface BotItemProps {
  bot: Bot;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
}

const BotItem: React.FC<BotItemProps> = ({ bot, onEdit, onDelete, onView }) => {
  return (
    <div className="flex items-center justify-between rounded border bg-white p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{bot.title}</h4>
          {bot.filesCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FileText size={12} />
              <span>{bot.filesCount} files</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600">
          <span className="mr-3">Subject: {bot.subject}</span>
          <span>Topic: {bot.topic}</span>
        </div>
        {bot.prompts?.greeting && (
          <p className="mt-1 truncate text-xs text-gray-500">{bot.prompts.greeting}</p>
        )}
      </div>
      <div className="flex space-x-1">
        <ItemActions
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          editTitle="Edit bot"
          deleteTitle="Delete bot"
          viewTitle="View bot details"
        />
      </div>
    </div>
  );
};

export default BotItem;
