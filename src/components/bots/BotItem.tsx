import React from 'react';

import { Edit, Eye, FileText, Trash } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

import { Bot } from '@/types/bot';

import { Button } from '@/components/ui/button';

interface BotItemProps {
  bot: Bot;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
}

const BotItem: React.FC<BotItemProps> = ({ bot, onEdit, onDelete, onView }) => {
  const { user } = useAuth();

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
          <p className="mt-1 text-xs text-gray-500 truncate">
            {bot.prompts.greeting}
          </p>
        )}
      </div>
      <div className="flex space-x-1">
        {user?.isProfessor ? (
          <>
            <Button
              onClick={onEdit}
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-700"
              title="Edit bot"
            >
              <Edit size={14} className="mr-1" />
              Edit
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-gray-600 hover:bg-red-100 hover:text-red-700"
              title="Delete bot"
            >
              <Trash size={14} className="mr-1" />
              Delete
            </Button>
          </>
        ) : (
          onView && (
            <Button
              onClick={onView}
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-700"
              title="View bot details"
            >
              <Eye size={14} className="mr-1" />
              View
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default BotItem;