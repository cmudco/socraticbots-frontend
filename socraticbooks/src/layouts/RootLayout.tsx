import React from 'react';
import Header from '../components/Header/Header';

interface RootLayoutProps {
  children: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div className="root-layout">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
};