// src/components/sidebar/Sidebar.tsx
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../stores/ui/uiStore';
import { NAVIGATION_ITEMS } from '../../types/navigation';
import SidebarButton from './SidebarButton';

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
    <div
      className={`fixed top-14 left-0 ${sidebarCollapsed ? 'w-16' : 'w-64'} z-10 h-[calc(100vh-3.5rem)] bg-white shadow-lg transition-all duration-300`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-[-12px] z-10 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
      >
        {sidebarCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
      </button>

      <div className={`flex h-full flex-col ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
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
          <div className="mt-4 border-t border-gray-200 pt-4">
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
