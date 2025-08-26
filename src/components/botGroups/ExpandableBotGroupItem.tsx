import React, { useState } from 'react';

import { ChevronDown, ChevronUp, Edit, Eye, Trash, Users } from 'lucide-react';

import { useIsProfessor } from '@/hooks/queries/useUser';

import { useUiStore } from '@/stores/ui/uiStore';

import BotList from '@/components/bots/BotList';
import { Button } from '@/components/ui/button';

import { BotGroup } from '@/types/botGroup';

interface ExpandableBotGroupItemProps {
  botGroup: BotGroup;
  onEdit: (botGroup: BotGroup) => void;
  onDelete: (botGroup: BotGroup) => void;
  onView?: (botGroup: BotGroup) => void;
}

const ExpandableBotGroupItem: React.FC<ExpandableBotGroupItemProps> = ({
  botGroup,
  onEdit,
  onDelete,
  onView,
}) => {
  const isProfessor = useIsProfessor();

  const { expandedBotGroups, toggleBotGroupExpansion } = useUiStore();
  const expanded = expandedBotGroups.has(botGroup.id);

  const [showActions, setShowActions] = useState(false);

  const toggleExpand = () => {
    toggleBotGroupExpansion(botGroup.id);
  };

  return (
    <div className="mb-4 overflow-hidden rounded-lg border">
      <div
        className="group hover:bg-accent flex cursor-pointer items-center justify-between p-4"
        onClick={toggleExpand}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">{botGroup.title}</h3>
            {botGroup.collaborators && botGroup.collaborators.length > 0 && (
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Users size={14} />
                <span>{botGroup.collaborators.length}</span>
              </div>
            )}
          </div>
          {botGroup.description && (
            <p className="text-muted-foreground text-sm">{botGroup.description}</p>
          )}
          <div className="text-muted-foreground mt-1 flex items-center gap-4 text-xs">
            <span>{botGroup.botsCount} bots</span>
            <span>Created {new Date(botGroup.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`flex space-x-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}
          >
            {isProfessor ? (
              <>
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(botGroup);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-auto px-2 py-1 text-xs"
                  title="Edit bot group"
                >
                  <Edit size={14} className="mr-1" />
                  Edit Group
                </Button>
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(botGroup);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-auto px-2 py-1 text-xs"
                  title="Delete bot group"
                >
                  <Trash size={14} className="mr-1" />
                  Delete
                </Button>
              </>
            ) : (
              onView && (
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    onView(botGroup);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-auto px-2 py-1 text-xs"
                  title="View bot group details"
                >
                  <Eye size={14} className="mr-1" />
                  View Details
                </Button>
              )
            )}
          </div>

          <div className="flex items-center">
            {expanded ? (
              <ChevronUp size={20} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={20} className="text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="bg-muted/50 border-t p-4">
          <BotList botGroupId={botGroup.id} initialBots={[]} onBotDeleted={() => {}} />
        </div>
      )}
    </div>
  );
};

export default ExpandableBotGroupItem;
