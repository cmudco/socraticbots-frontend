// src/components/common/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../../assets/logo.png';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 z-20 h-14 bg-white shadow-md">
      <div className="flex h-full items-center justify-between px-4">
        {' '}
        {/* Reduced padding here */}
        <div className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Socratic Books Logo"
            className="h-8 w-8 object-contain" // Adjust size as needed
          />
          <Link to="/" className="text-xl font-bold text-gray-600">
            Socratic Books
          </Link>
        </div>
        <nav>
          {isAuthenticated ? (
            <button onClick={logout} className="text-gray-600 hover:text-blue-500">
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-blue-500">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
