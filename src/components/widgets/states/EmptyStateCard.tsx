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
  className = 'rounded-lg bg-gray-50 p-6 text-center',
}) => {
  const isProfessor = useIsProfessor();

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-600">
        {isProfessor ? professorTitle : studentTitle}
      </h3>
      <p className="mt-1 text-gray-500">{isProfessor ? professorMessage : studentMessage}</p>

      {isProfessor && actionText && onAction && (
        <Button onClick={onAction} className="mt-4 bg-violet-600 text-white hover:bg-violet-700">
          <Plus size={16} />
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyStateCard;
