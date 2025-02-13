// src/components/Books.tsx
import React, { useEffect, useState } from 'react';
import { getBooks, Book } from '../../services/booksService';
import { useAuthContext } from '../../contexts/AuthContext';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import { Typography } from '@mui/material';

const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthContext(); // Using your auth context

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                if (user?.uid) {  // Check if user exists and has uid
                    const booksData = await getBooks(user.uid);
                    setBooks(booksData);
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [user]);

    if (!user) {
        return <div>Please log in to view your books.</div>;
    }

    if (loading) {
        return <div>Loading your books...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" sx={{ mb: 3 }}>My Books</Typography>
            <p>Here you can view/edit/create books. Books are how you can group content together. </p>
            <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Title</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Created</strong></TableCell>
                            <TableCell><strong>Last Updated</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {books.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No books found. Create your first book!
                                </TableCell>
                            </TableRow>
                        ) : (
                            books.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell>{book.title}</TableCell>
                                    <TableCell>{book.description}</TableCell>
                                    <TableCell>
                                        {new Date(book.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(book.updated_at).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </div>
    );
};

export default Books;
