// src/components/Header/Header.tsx
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <div className="header">
      <div className="header-content">
        <h1 className="header-title">SocraticBooks</h1>
        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
    </div>
  );
};

export default Header;