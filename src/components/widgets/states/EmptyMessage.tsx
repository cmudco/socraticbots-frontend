import React from 'react';

import { useIsCreator } from '@/hooks/queries/useUser';

interface EmptyMessageProps {
  creatorMessage: string;
  studentMessage: string;
  className?: string;
}

/**
 * Simple empty state message that changes based on user role
 */
const EmptyMessage: React.FC<EmptyMessageProps> = ({
  creatorMessage,
  studentMessage,
  className = 'py-4 text-center text-muted-foreground',
}) => {
  const isCreator = useIsCreator();

  return <p className={className}>{isCreator ? creatorMessage : studentMessage}</p>;
};

export default EmptyMessage;
