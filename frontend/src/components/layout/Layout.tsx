// components/layout/Layout.tsx
import React, { ReactNode } from 'react';
import Header from '../common/Header';
import Sidebar from '../sidebar/Sidebar';
import { useAppSelector } from '../../store/hooks';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isCollapsed } = useAppSelector(state => state.sidebar);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow">
        <Sidebar />
        <main className={`
          ${isCollapsed ? 'ml-16' : 'ml-64'} 
          flex-grow p-6
          transition-all duration-300
        `}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;