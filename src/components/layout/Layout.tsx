import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useIsAuthenticated } from '@/hooks/queries/useUser';

import { useUiStore } from '@/stores/ui/uiStore';

import Header from '@/components/common/Header';
import Sidebar from '@/components/sidebar/Sidebar';

const Layout: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const { sidebarCollapsed } = useUiStore();
  const location = useLocation();

  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1 pt-14">
        {' '}
        {isAuthenticated && <Sidebar />}
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
