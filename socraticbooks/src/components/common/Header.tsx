import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-socratic text-white z-10"> 
            <div className="container mx-1 px-3 h-full flex items-center">
                <h1 className="text-2xl font-bold">Socratic Books</h1>
            </div>
        </header>
    );
};

export default Header;