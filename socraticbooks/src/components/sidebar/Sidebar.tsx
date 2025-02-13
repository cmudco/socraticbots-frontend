import { ScreenType } from '../../types/navigation';
import SidebarButton from './SidebarButton';

interface SidebarProps {
    currentScreen: ScreenType;
    onNavigate: (screen: ScreenType) => void;
}

const Sidebar = ({ currentScreen, onNavigate }: SidebarProps) => {
    return (
        <div className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-white shadow-lg p-4">
            <div className="flex flex-col space-y-2">
                <SidebarButton screen="home" currentScreen={currentScreen} onNavigate={onNavigate} label="Home" />
            </div>
        </div>
    );
};

export default Sidebar;
