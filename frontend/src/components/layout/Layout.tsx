import React from 'react';
import Header from '../common/Header'; // Update path as needed
import Sidebar from '../sidebar/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useAppSelector } from '../../store/hooks';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isCollapsed } = useAppSelector(state => state.sidebar);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-14"> {/* Assuming your header is 3.5rem (14) tall */}
        {/* Sidebar is conditionally rendered inside its component */}
        <Sidebar />
        <main className={`
          flex-1 
          transition-all 
          duration-300
          p-6
          ${isAuthenticated ? (isCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}
        `}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;