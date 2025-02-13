import React from 'react';
import { Typography } from '@mui/material';

interface BooksHeaderProps {
    onCreateClick: () => void;
}

const BooksHeader: React.FC<BooksHeaderProps> = ({ onCreateClick }) => {
    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <Typography variant="h4" sx={{ mb: 3 }}>My Books</Typography>
                <button 
                    onClick={onCreateClick}
                    className="h-10 px-4 bg-socratic hover:bg-socratic-dark text-socratic-font-light rounded transition-colors"
                >
                    Create New Book
                </button>
            </div>
            <p className="mb-4">Here you can view/edit/create books. Books are how you can group content together.</p>
        </>
    );
};

export default BooksHeader;
