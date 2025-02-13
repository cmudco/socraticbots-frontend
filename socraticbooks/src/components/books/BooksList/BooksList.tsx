import React, { useState } from 'react';
import { Book } from '../../../services/booksService';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import BookRow from './BookRow';
import ExpandedChapters from './ExpandedChapters';

interface BooksListProps {
    books: Book[];
    onEditBook: (book: Book) => void;
    onDeleteBook: (bookId: string) => void;
}

const BooksList: React.FC<BooksListProps> = ({ books, onEditBook, onDeleteBook }) => {
    const [expandedBookId, setExpandedBookId] = useState<string | null>(null);

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell width="50"></TableCell>
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Description</strong></TableCell>
                        <TableCell><strong>Created</strong></TableCell>
                        <TableCell><strong>Last Updated</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {books.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                No books found. Create your first book!
                            </TableCell>
                        </TableRow>
                    ) : (
                        books.map((book) => (
                            <React.Fragment key={book.id}>
                                <BookRow 
                                    book={book}
                                    isExpanded={expandedBookId === book.id}
                                    onToggleExpand={() => setExpandedBookId(
                                        expandedBookId === book.id ? null : book.id
                                    )}
                                    onEdit={() => onEditBook(book)}
                                    onDelete={() => onDeleteBook(book.id)}
                                />
                                {expandedBookId === book.id && (
                                    <ExpandedChapters bookId={book.id} />
                                )}
                            </React.Fragment>
                        ))
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default BooksList;
