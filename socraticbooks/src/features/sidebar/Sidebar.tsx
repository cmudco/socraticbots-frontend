// src/features/sidebar/Sidebar.tsx
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/books">My Books</Link>
          </li>
          <li>
            <Link to="/chapters">My Chapters</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;