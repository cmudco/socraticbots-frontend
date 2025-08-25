import React from 'react';
import { Link } from 'react-router-dom';

import { LucideIcon } from 'lucide-react';

interface SidebarButtonProps {
  to: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  to,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-2 ${
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent'
      } `}
      title={isCollapsed ? label : ''}
    >
      <Icon size={20} className="min-w-[20px]" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export default SidebarButton;
