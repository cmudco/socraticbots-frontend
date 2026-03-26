import * as React from 'react';

import { cn } from '@/lib/utils';

type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'onClick'> & {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

function Switch({
  className,
  id,
  checked = false,
  onCheckedChange,
  disabled,
  ...props
}: SwitchProps) {
  const handleToggle = React.useCallback(() => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  }, [checked, disabled, onCheckedChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      data-slot="switch"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        'focus-visible:ring-ring/50 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-input/50',
        className
      )}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          'bg-background pointer-events-none block h-5 w-5 rounded-full shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

export { Switch };
