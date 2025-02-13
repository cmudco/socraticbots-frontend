import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { getUserAffiliation } from '../../services/user';
import SidebarButton from './SidebarButton';
import { NAVIGATION_ITEMS } from '../../types/navigation';

const Sidebar = () => {
    const user = useAuthContext();
    const [affiliation, setAffiliation] = useState<string | null>(null);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

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
        return <div className="fixed left-0 top-14 w-64 h-[calc(100vh-3.5rem)] bg-white shadow-lg p-4">
            Loading...
        </div>;
    }

    return (
        
        <div className="fixed left-0 top-14 w-64 h-[calc(100vh-3.5rem)] bg-white shadow-lg p-4">
            <div className="flex flex-col space-y-2">
                {NAVIGATION_ITEMS
                    .filter(item => 
                        item.requiresAuth && 
                        (!item.requiredAffiliation || item.requiredAffiliation === affiliation)
                    )
                    .map(item => (
                        <SidebarButton
                            key={item.path}
                            to={item.path}
                            label={item.label}
                            isActive={location.pathname === item.path}
                        />
                    ))}
            </div>
        </div>
    );
};

export default Sidebar;
