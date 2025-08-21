import React from 'react';

import { Plus } from 'lucide-react';

import { useIsProfessor } from '@/hooks/queries/useUser';

import { Button } from '@/components/ui/button';

interface CreateButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline';
}

/**
 * A button that only shows for professors
 * Common pattern across the app for create actions
 */
const CreateButton: React.FC<CreateButtonProps> = ({
  onClick,
  children,
  className = '',
  size = 'default',
  variant = 'default',
}) => {
  const isProfessor = useIsProfessor();

  if (!isProfessor) return null;

  return (
    <Button onClick={onClick} className={className} size={size} variant={variant}>
      <Plus size={size === 'sm' ? 14 : 16} />
      {children}
    </Button>
  );
};

export default CreateButton;
