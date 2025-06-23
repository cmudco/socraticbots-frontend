// src/components/common/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 h-14 z-20">
      <div className="h-full flex justify-between items-center px-4"> {/* Reduced padding here */}
        <div className="flex items-center space-x-2">
        <img 
            src={logo} 
            alt="Socratic Books Logo" 
            className="h-8 w-8 object-contain" // Adjust size as needed
          />
          <Link to="/" className="text-xl font-bold text-gray-600">Socratic Books</Link>
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
