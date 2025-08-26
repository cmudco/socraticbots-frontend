import React from 'react';
import { Link } from 'react-router-dom';

import { Edit, Eye, MessageSquare, Trash } from 'lucide-react';

import { useIsProfessor } from '@/hooks/queries/useUser';

import { Button } from '@/components/ui/button';

interface ItemActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  editTitle?: string;
  deleteTitle?: string;
  viewTitle?: string;
  chatTo?: string;
  chatTitle?: string;
}

/**
 * Standard action buttons that appear on list items
 * Shows Edit/Delete for professors, View for students
 */
const ItemActions: React.FC<ItemActionsProps> = ({
  onEdit,
  onDelete,
  onView,
  editTitle = 'Edit',
  deleteTitle = 'Delete',
  viewTitle = 'View details',
  chatTo,
  chatTitle = 'Open chat',
}) => {
  const isProfessor = useIsProfessor();

  const buttonClass = 'h-auto px-2 py-1 text-xs text-muted-foreground';

  if (isProfessor) {
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
      {onView && (
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
      )}
    </>
  );
};

export default ItemActions;
