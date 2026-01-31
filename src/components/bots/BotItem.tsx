import React from 'react';

import { FileText } from 'lucide-react';

import { useIsCreator, useUser } from '@/hooks/queries/useUser';

import ItemActions from '@/components/widgets/actions/ItemActions';

import { Bot } from '@/types/bot';

interface BotItemProps {
  bot: Bot;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  onClone?: () => void;
}

const BotItem: React.FC<BotItemProps> = ({ bot, onEdit, onDelete, onView, onClone }) => {
  const user = useUser();
  const isCreator = useIsCreator();
  const canManage = isCreator && user?.id === bot.createdById;
  return (
    <div className="bg-background flex items-center justify-between rounded border p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-foreground font-medium">{bot.title}</h4>
          {bot.filesCount > 0 && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <FileText size={12} />
              <span>{bot.filesCount} files</span>
            </div>
          )}
        </div>
        <div className="text-muted-foreground max-w-[50vw] text-sm">
          <span className="mr-3">Subject: {bot.subject}</span>
          <span>Topic: {bot.topic}</span>
        </div>
        {bot.prompts?.greeting && (
          <p className="text-muted-foreground mt-1 max-w-[80vw] text-xs break-words">
            {bot.prompts.greeting}
          </p>
        )}
      </div>
      <div className="flex space-x-1">
        <ItemActions
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onClone={onClone}
          editTitle="Edit bot"
          deleteTitle="Delete bot"
          viewTitle="View bot details"
          chatTo={`/chat/${bot.id}`}
          chatTitle="Chat with this bot"
          canManage={canManage}
        />
      </div>
    </div>
  );
};

export default BotItem;
