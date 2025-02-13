import { useEffect, useState } from 'react';
import { ScreenType } from '../../types/navigation';
import SidebarButton from './SidebarButton';
import { useAuthContext } from '../../contexts/AuthContext';
import { getUserAffiliation } from '../../services/user';

interface SidebarProps {
    currentScreen: ScreenType;
    onNavigate: (screen: ScreenType) => void;
}

const Sidebar = ({ currentScreen, onNavigate }: SidebarProps) => {
    const user = useAuthContext();
    const [affiliation, setAffiliation] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            getUserAffiliation(user.uid)
                .then(setAffiliation)
                .catch(err => console.error('Failed to get affiliation:', err));
        }
    }, [user]);

    return (
        <div className="fixed left-0 top-14 w-64 h-[calc(100vh-3.5rem)] bg-white shadow-lg p-4">
            <div className="flex flex-col space-y-2">
                <SidebarButton screen="home" currentScreen={currentScreen} onNavigate={onNavigate} label="Home" />
                
                {/* PROFESSORS */}
                {affiliation === 'professor' && (
                    <SidebarButton screen="books" currentScreen={currentScreen} onNavigate={onNavigate} label="Books" />
                )}
            </div>
        </div>
    );
};

export default Sidebar;
