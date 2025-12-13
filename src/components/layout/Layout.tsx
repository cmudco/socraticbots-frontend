import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useIsAuthenticated } from '@/hooks/queries/useUser';

import { useUiStore } from '@/stores/ui/uiStore';

import Header from '@/components/common/Header';
import Sidebar from '@/components/sidebar/Sidebar';
import SystemBanner from '@/components/ui/SystemBanner';

const Layout: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const { sidebarCollapsed } = useUiStore();
  const location = useLocation();

  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      <div className="flex min-h-0 flex-1 pt-14">
        {isAuthenticated && <Sidebar />}
        <div
          className={`relative min-h-0 flex-1 transition-all duration-300 ${isAuthenticated ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}`}
        >
          {/* System Banner - absolute positioned overlay at top of content area */}
          {isAuthenticated && <SystemBanner className="absolute top-0 right-0 left-0 z-40" />}

          <main className={`h-full ${isChatPage ? 'overflow-hidden' : 'overflow-auto p-6'}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
