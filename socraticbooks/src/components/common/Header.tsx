import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { logout } from '../../services/auth';

const Header: React.FC = () => {
    const user = useAuthContext();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.pathname = '/';
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };
    
    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-socratic text-socratic-font-light z-10"> 
            <div className="w-full h-full flex items-center justify-between px-3">
                <h1 className="text-2xl font-bold">Socratic Books</h1>
                
                {user && (
                    <div className="flex items-center gap-0">
                        <span className="text-sm">{user.email}</span>
                        <button 
                            onClick={handleLogout}
                            className="mx-3 px-3 py-1 text-sm bg-socratic-dark text-socratic-font-light rounded hover:bg-socratic-light transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
