import { useEffect, useState } from 'react';
import { ScreenType } from '../../types/navigation';
import SidebarButton from './SidebarButton';
import { useAuthContext } from '../../contexts/AuthContext';

interface SidebarProps {
    currentScreen: ScreenType;
    onNavigate: (screen: ScreenType) => void;
}

const Sidebar = ({ currentScreen, onNavigate }: SidebarProps) => {
    const user = useAuthContext();
    const [affiliation, setAffiliation] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetch(`https://dare.hss.cmu.edu/api/socratic-books/users/${user.uid}`)
                .then(res => res.json())
                .then(data => setAffiliation(data.affiliation))
                .catch(err => console.error('Failed to get affiliation:', err));
        }
    }, [user]);

    return (
        <div className="fixed left-0 top-14 w-64 h-[calc(100vh-3.5rem)] bg-white shadow-lg p-4">
            <div className="flex flex-col space-y-2">
                <SidebarButton screen="home" currentScreen={currentScreen} onNavigate={onNavigate} label="Home" />
                
                {/* JUST THIS ONE NEW BUTTON FOR PROFESSORS */}
                {affiliation === 'professor' && (
                    <SidebarButton screen="books" currentScreen={currentScreen} onNavigate={onNavigate} label="Books" />
                )}
            </div>
        </div>
    );
};

export default Sidebar;
