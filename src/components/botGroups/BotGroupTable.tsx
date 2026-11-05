import React from 'react';

import { BotGroup } from '@/types/botGroup';

import ExpandableBotGroupItem from './ExpandableBotGroupItem';

interface BotGroupTableProps {
  botGroups: BotGroup[];
  onEdit: (botGroup: BotGroup) => void;
  onDelete: (botGroup: BotGroup) => void;
  onView?: (botGroup: BotGroup) => void;
}

const BotGroupTable: React.FC<BotGroupTableProps> = ({ botGroups, onEdit, onDelete, onView }) => {
  return (
    <div className="space-y-4">
      {botGroups.map(botGroup => (
        <ExpandableBotGroupItem
          key={botGroup.id}
          botGroup={botGroup}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default BotGroupTable;
