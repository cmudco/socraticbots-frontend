import React from 'react';

import { useIsProfessor } from '@/hooks/queries/useUser';

interface EmptyMessageProps {
  professorMessage: string;
  studentMessage: string;
  className?: string;
}

/**
 * Simple empty state message that changes based on user role
 */
const EmptyMessage: React.FC<EmptyMessageProps> = ({
  professorMessage,
  studentMessage,
  className = 'py-4 text-center text-muted-foreground',
}) => {
  const isProfessor = useIsProfessor();

  return <p className={className}>{isProfessor ? professorMessage : studentMessage}</p>;
};

export default EmptyMessage;
