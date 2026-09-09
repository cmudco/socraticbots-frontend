import React from 'react';

/** Step title line; extra inline detail goes in children. */
export const StepHeader: React.FC<{
  title: string;
  children?: React.ReactNode;
}> = ({ title, children }) => (
  <div className="text-foreground flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-medium [overflow-wrap:anywhere] break-words">
    {title}
    {children}
  </div>
);
