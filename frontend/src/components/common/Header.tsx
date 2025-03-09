// components/common/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">My App</h1>
        <nav>
            <Link to="/" className="mr-4">Home</Link>
            <Link to="/about">About</Link>
        </nav>
      </header>
    );
  };
  
  export default Header;