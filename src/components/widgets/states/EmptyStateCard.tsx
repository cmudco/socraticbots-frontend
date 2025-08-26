import React from 'react';

import { Plus } from 'lucide-react';

import { useIsProfessor } from '@/hooks/queries/useUser';

import { Button } from '@/components/ui/button';

interface EmptyStateCardProps {
  professorTitle: string;
  professorMessage: string;
  studentTitle: string;
  studentMessage: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Full empty state card with different content for professors vs students
 * Professors get an action button, students get informational text
 */
const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  professorTitle,
  professorMessage,
  studentTitle,
  studentMessage,
  actionText,
  onAction,
  className = 'rounded-lg bg-muted/50 p-6 text-center',
}) => {
  const isProfessor = useIsProfessor();

  return (
    <div className={className}>
      <h3 className="text-muted-foreground text-lg font-medium">
        {isProfessor ? professorTitle : studentTitle}
      </h3>
      <p className="text-muted-foreground mt-1">
        {isProfessor ? professorMessage : studentMessage}
      </p>

      {isProfessor && actionText && onAction && (
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
