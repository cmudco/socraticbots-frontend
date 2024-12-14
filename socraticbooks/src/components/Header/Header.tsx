// src/components/Header/Header.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../config/firebase';
import './Header.css';

const Header = () => {
    const { user } = useAuth();
  
    const handleLogout = async () => {
      try {
        await auth.signOut();
      } catch (error) {
        console.error('Failed to log out');
      }
    };
  
    return (
      <div className="header">
        <div className="header-content">
          <h1 className="header-title">SocraticBooks</h1>
          <nav className="header-nav">
            <Link to="/about">About</Link>
            {!user ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    );
  };
  
  export default Header;