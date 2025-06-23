// src/components/sidebar/SidebarButton.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IconType } from 'react-icons';

interface SidebarButtonProps {
    to: string;
    label: string;
    icon: IconType;
    isActive: boolean;
    isCollapsed: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ 
    to, 
    label, 
    icon: Icon, 
    isActive,
    isCollapsed 
}) => {
    return (
        <Link 
            to={to}
            className={`
                flex items-center rounded-lg transition-all duration-200
                ${isCollapsed ? 'justify-center px-3' : 'px-4 space-x-3'} 
                py-2
                ${isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-blue-100'
                }
            `}
            title={isCollapsed ? label : ''}
        >
            <Icon size={20} className="min-w-[20px]" />
            {!isCollapsed && <span>{label}</span>}
        </Link>
    );
};

export default SidebarButton;
