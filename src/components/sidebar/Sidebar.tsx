// src/components/sidebar/Sidebar.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import SidebarButton from './SidebarButton';
import { NAVIGATION_ITEMS } from '../../types/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useUiStore } from '../../stores/uiStore';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { sidebarCollapsed, toggleSidebar } = useUiStore();
    const { isAuthenticated } = useAuth();

    // Don't render sidebar at all if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    const mainNavItems = NAVIGATION_ITEMS.filter(item => item.path !== '/settings');
    const settingsItem = NAVIGATION_ITEMS.find(item => item.path === '/settings');

    return (
        <div className={`
            fixed left-0 top-14
            ${sidebarCollapsed ? 'w-16' : 'w-64'}
            h-[calc(100vh-3.5rem)]
            bg-white shadow-lg
            transition-all duration-300
            z-10
        `}>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute right-[-12px] top-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
            >
                {sidebarCollapsed
                    ? <FaChevronRight size={12} />
                    : <FaChevronLeft size={12} />
                }
            </button>

            <div className={`flex flex-col h-full ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
                {/* Main navigation items */}
                <div className="flex-grow space-y-2">
                    {mainNavItems.map(item => (
                        <SidebarButton
                            key={item.path}
                            to={item.path}
                            label={item.label}
                            icon={item.icon}
                            isActive={location.pathname === item.path}
                            isCollapsed={sidebarCollapsed}
                        />
                    ))}
                </div>

                {/* Settings button at bottom */}
                {settingsItem && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                        <SidebarButton
                            to={settingsItem.path}
                            label={settingsItem.label}
                            icon={settingsItem.icon}
                            isActive={location.pathname === settingsItem.path}
                            isCollapsed={sidebarCollapsed}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
