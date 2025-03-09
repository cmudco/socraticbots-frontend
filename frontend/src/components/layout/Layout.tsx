// components/layout/Layout.tsx
import React, { ReactNode } from 'react';
import Header from '../common/Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      <div>
        {children}
      </div>
    </div>
  );
};

export default Layout;
