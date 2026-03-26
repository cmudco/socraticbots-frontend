import React from 'react';

import { Plus } from 'lucide-react';

import { useIsCreator } from '@/hooks/queries/useUser';

import { Button } from '@/components/ui/button';

interface EmptyStateCardProps {
  creatorTitle: string;
  creatorMessage: string;
  studentTitle: string;
  studentMessage: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Full empty state card with different content for creators vs students
 * Creators get an action button, students get informational text
 */
const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  creatorTitle,
  creatorMessage,
  studentTitle,
  studentMessage,
  actionText,
  onAction,
  className = 'rounded-lg bg-muted/50 p-6 text-center',
}) => {
  const isCreator = useIsCreator();

  return (
    <div className={className}>
      <h3 className="text-muted-foreground text-lg font-medium">
        {isCreator ? creatorTitle : studentTitle}
      </h3>
      <p className="text-muted-foreground mt-1">{isCreator ? creatorMessage : studentMessage}</p>

      {isCreator && actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-primary text-primary-foreground hover:bg-primary/80 mt-4"
        >
          <Plus size={16} />
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyStateCard;
