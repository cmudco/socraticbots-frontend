import { Link } from 'react-router-dom';

interface SidebarButtonProps {
    to: string;
    label: string;
    isActive: boolean;
}

const SidebarButton = ({ to, label, isActive }: SidebarButtonProps) => {
    return (
        <Link 
            to={to}
            className={`block w-full text-left px-4 py-2 rounded-lg transition-colors duration-200
                ${isActive 
                    ? 'bg-socratic text-socratic-font-light' 
                    : 'text-gray-700 hover:bg-socratic-light hover:text-socratic-font-light'
                }`
            }
        >
            {label}
        </Link>
    );
};

export default SidebarButton;
