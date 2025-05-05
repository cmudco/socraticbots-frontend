// src/components/sidebar/Sidebar.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import SidebarButton from './SidebarButton';
import { NAVIGATION_ITEMS } from '../../types/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/sidebarSlice';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { isCollapsed } = useAppSelector(state => state.sidebar);
    const { isAuthenticated, user } = useAuth();
    
    // Don't render sidebar at all if not authenticated
    if (!isAuthenticated) {
        return null;
    }
    
    // Check if user is a Honda user
    const isHondaUser = user?.username?.toLowerCase().startsWith('honda');
    
    // Filter navigation items based on user type
    let visibleNavItems;
    if (isHondaUser) {
        // Honda users only see the Chat option
        visibleNavItems = NAVIGATION_ITEMS.filter(item => item.path === '/chat');
    } else {
        // Regular users see all items except settings
        visibleNavItems = NAVIGATION_ITEMS.filter(item => item.path !== '/settings');
    }
    
    // Only show settings for non-Honda users
    const settingsItem = !isHondaUser ? NAVIGATION_ITEMS.find(item => item.path === '/settings') : null;

    return (
        <div className={`
            fixed left-0 top-14
            ${isCollapsed ? 'w-16' : 'w-64'} 
            h-[calc(100vh-3.5rem)] 
            bg-white shadow-lg 
            transition-all duration-300
            z-10
        `}>
            {/* Toggle Button - Only show for non-Honda users or if there are multiple items */}
            {(visibleNavItems.length > 1 || !isHondaUser) && (
                <button 
                    onClick={() => dispatch(toggleSidebar())}
                    className="absolute right-[-12px] top-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
                >
                    {isCollapsed 
                        ? <FaChevronRight size={12} /> 
                        : <FaChevronLeft size={12} />
                    }
                </button>
            )}

            <div className={`flex flex-col h-full ${isCollapsed ? 'p-2' : 'p-4'}`}>
                {/* Main navigation items */}
                <div className="flex-grow space-y-2">
                    {visibleNavItems.map(item => (
                        <SidebarButton
                            key={item.path}
                            to={item.path}
                            label={item.label}
                            icon={item.icon}
                            isActive={location.pathname === item.path}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>
                
                {/* Settings button at bottom - only for non-Honda users */}
                {settingsItem && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                        <SidebarButton
                            to={settingsItem.path}
                            label={settingsItem.label}
                            icon={settingsItem.icon}
                            isActive={location.pathname === settingsItem.path}
                            isCollapsed={isCollapsed}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;