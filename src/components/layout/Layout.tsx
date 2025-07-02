//src/components/layout/Layout.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

import { useUiStore } from '@/stores/ui/uiStore';

import Header from '@/components/common/Header';
import Sidebar from '@/components/sidebar/Sidebar';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { sidebarCollapsed } = useUiStore();
  const location = useLocation();

  // Chat page needs special full-height layout
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - always present */}
      <Header />

      <div className="flex flex-1 pt-14">
        {' '}
        {/* pt-14 accounts for fixed header */}
        {/* Sidebar - always present when authenticated */}
        {isAuthenticated && <Sidebar />}
        {/* Main content area with outlet */}
        <main
          className={`flex-1 transition-all duration-300 ${isChatPage ? 'h-[calc(100vh-3.5rem)] overflow-hidden' : 'p-6'} ${isAuthenticated ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'} `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
