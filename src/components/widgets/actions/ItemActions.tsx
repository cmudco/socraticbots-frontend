import React from 'react';
import { Link } from 'react-router-dom';

import { Copy, Edit, MessageSquare, Trash } from 'lucide-react';

import { useIsCreator } from '@/hooks/queries/useUser';

import { Button } from '@/components/ui/button';

interface ItemActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onClone?: () => void;
  onView?: () => void;
  editTitle?: string;
  deleteTitle?: string;
  cloneTitle?: string;
  viewTitle?: string;
  chatTo?: string;
  chatTitle?: string;
  canManage?: boolean;
}

/**
 * Standard action buttons that appear on list items
 * Shows Edit/Delete for creators, View for students
 */
const ItemActions: React.FC<ItemActionsProps> = ({
  onEdit,
  onDelete,
  onClone,
  editTitle = 'Edit',
  deleteTitle = 'Delete',
  cloneTitle = 'Clone',
  chatTo,
  chatTitle = 'Open chat',
  canManage = true,
}) => {
  const isCreator = useIsCreator();

  const buttonClass = 'h-auto px-2 py-1 text-xs text-muted-foreground';

  if (isCreator && canManage) {
    return (
      <>
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className={`${buttonClass} hover:bg-accent hover:text-accent-foreground`}
            title={editTitle}
          >
            <Edit size={14} className="mr-1" />
            Edit
          </Button>
        )}
        {onClone && (
          <Button
            onClick={onClone}
            variant="ghost"
            size="sm"
            className={`${buttonClass} hover:bg-accent hover:text-accent-foreground`}
            title={cloneTitle}
          >
            <Copy size={14} className="mr-1" />
            Clone
          </Button>
        )}
        {onDelete && (
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className={`${buttonClass} hover:bg-destructive/10 hover:text-destructive`}
            title={deleteTitle}
          >
            <Trash size={14} className="mr-1" />
            Delete
          </Button>
        )}
      </>
    );
  }

  // Student view
  return (
    <>
      {chatTo && (
        <Link to={chatTo} title={chatTitle}>
          <Button
            variant="ghost"
            size="sm"
            className={`${buttonClass} hover:bg-primary/10 hover:text-primary`}
          >
            <MessageSquare size={14} className="mr-1" />
            Open Chat
          </Button>
        </Link>
      )}
      {/* {onView && (
        <Button
          onClick={onView}
          variant="ghost"
          size="sm"
          className={`${buttonClass} hover:bg-accent hover:text-accent-foreground`}
          title={viewTitle}
        >
          <Eye size={14} className="mr-1" />
          View
        </Button>
      )} */}
    </>
  );
};

export default ItemActions;
