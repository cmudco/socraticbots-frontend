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
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-blue-500 hover:text-white'
                }`
            }
        >
            {label}
        </button>
    );
};

export default SidebarButton;
