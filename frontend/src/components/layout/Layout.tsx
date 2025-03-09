// components/layout/Layout.tsx
import React, { ReactNode } from 'react';
import Header from '../common/Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow p-4">
          {children}
        </main>
      </div>
    );
  };
  
  export default Layout;