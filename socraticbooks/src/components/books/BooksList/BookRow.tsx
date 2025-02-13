import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import { Book } from '../../../services/booksService';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';

interface BookRowProps {
    book: Book;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const BookRow: React.FC<BookRowProps> = ({
    book,
    isExpanded,
    onToggleExpand,
    onEdit,
    onDelete
}) => {
    return (
        <TableRow 
            className="hover:bg-gray-50 cursor-pointer"
            onClick={onToggleExpand}
        >
            <TableCell>
                <button className="p-1">
                    {isExpanded ? (
                        <KeyboardArrowDown className="w-5 h-5" />
                    ) : (
                        <KeyboardArrowRight className="w-5 h-5" />
                    )}
                </button>
            </TableCell>
            <TableCell>{book.title}</TableCell>
            <TableCell>{book.description}</TableCell>
            <TableCell>
                {book.created_at ? new Date(book.created_at).toLocaleDateString() : 'Just now'}
            </TableCell>
            <TableCell>
                {book.updated_at ? new Date(book.updated_at).toLocaleDateString() : 'Just now'}
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="bg-socratic hover:bg-socratic-dark text-socratic-font-light font-bold py-1 px-3 rounded text-sm transition-colors"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default BookRow;
