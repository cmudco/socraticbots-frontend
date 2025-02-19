// src/components/sidebar/SidebarButton.tsx
import { Link } from 'react-router-dom';
import { IconType } from 'react-icons';

interface SidebarButtonProps {
    to: string;
    label: string;
    icon: IconType;
    isActive: boolean;
    isCollapsed: boolean;
}

const SidebarButton = ({ to, label, icon: Icon, isActive, isCollapsed }: SidebarButtonProps) => {
    return (
        <Link 
            to={to}
            className={`
                block w-full rounded-lg transition-all duration-200
                ${isCollapsed ? 'px-3' : 'px-4'} py-2
                ${isActive 
                    ? 'bg-socratic text-socratic-font-light' 
                    : 'text-gray-700 hover:bg-socratic-light hover:text-socratic-font-light'
                }
            `}
            title={isCollapsed ? label : ''}
        >
            <div className={`
                flex items-center
                ${isCollapsed ? 'justify-center' : 'space-x-3'}
            `}>
                <Icon size={20} className="min-w-[20px]" />
                {!isCollapsed && <span>{label}</span>}
            </div>
        </Link>
    );
};

export default SidebarButton;
