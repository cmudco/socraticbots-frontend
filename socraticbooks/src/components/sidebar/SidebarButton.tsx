import { ScreenType } from '../../types/navigation';

interface SidebarButtonProps {
    screen: ScreenType;
    currentScreen: ScreenType;
    onNavigate: (screen: ScreenType) => void;
    label: string;
}

const SidebarButton = ({ screen, currentScreen, onNavigate, label }: SidebarButtonProps) => {
    return (
        <button 
            onClick={() => onNavigate(screen)}
            className={`w-full text-left px-4 py-2 rounded-lg
                ${currentScreen === screen 
                    ? 'bg-socratic text-white' 
                    : 'text-gray-700 hover:bg-socratic-light hover:text-white'
                }`
            }
        >
            {label}
        </button>
    );
};

export default SidebarButton;
