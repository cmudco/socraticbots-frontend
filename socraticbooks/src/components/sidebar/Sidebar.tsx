import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { getUserAffiliation } from '../../services/user';
import SidebarButton from './SidebarButton';
import { NAVIGATION_ITEMS } from '../../types/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // You'll need to install react-icons

const Sidebar = () => {
    const user = useAuthContext();
    const [affiliation, setAffiliation] = useState<string | null>(null);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getUserAffiliation(user.uid)
                .then(setAffiliation)
                .catch(err => console.error('Failed to get affiliation:', err))
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className={`fixed left-0 top-14 ${isCollapsed ? 'w-16' : 'w-64'} h-[calc(100vh-3.5rem)] bg-white shadow-lg p-4 flex items-center justify-center transition-all duration-300`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-socratic"></div>
            </div>
        );
    }

    return (
        <div className={`fixed left-0 top-14 ${isCollapsed ? 'w-16' : 'w-64'} h-[calc(100vh-3.5rem)] bg-white shadow-lg transition-all duration-300`}>
            {/* Toggle Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute right-[-12px] top-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
            >
                {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
            </button>

            <div className="flex flex-col h-full p-4">
                {/* Main navigation items */}
                <div className="flex-grow space-y-2">
                    {NAVIGATION_ITEMS
                        .filter(item => 
                            item.requiresAuth && 
                            item.path !== '/settings' &&
                            (!item.requiredAffiliation || item.requiredAffiliation === affiliation)
                        )
                        .map(item => (
                            <SidebarButton
                                key={item.path}
                                to={item.path}
                                label={item.label}
                                isActive={location.pathname === item.path}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                </div>
                {/* Settings button at bottom */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                    <SidebarButton
                        to="/settings"
                        label="Settings"
                        isActive={location.pathname === '/settings'}
                        isCollapsed={isCollapsed}
                    />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
