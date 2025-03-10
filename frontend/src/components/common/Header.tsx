// src/components/common/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">Socratic Books</Link>
        </div>
        
        <nav>
          {isAuthenticated ? (
            <button 
              onClick={logout} 
              className="text-gray-600 hover:text-blue-500"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-blue-500">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
