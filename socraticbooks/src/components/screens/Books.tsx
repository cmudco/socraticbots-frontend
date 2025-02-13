// src/components/Books.tsx
import React, { useEffect, useState } from 'react';
import { getBooks, Book, createBook} from '../../services/booksService';
import { useAuthContext } from '../../contexts/AuthContext';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, Button } from '@mui/material';
import { Typography } from '@mui/material';
import CreateBookModal from '../modals/CreateBookModal';

const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const user = useAuthContext(); // Using your auth context

    const handleCreateBook = async (title: string, description: string) => {
        try {
            if (user?.uid) {
                const createdBook = await createBook(user.uid, title, description);
                setBooks([createdBook, ...books]);
                setOpenModal(false);
            }
        } catch (error) {
            console.error('Error creating book:', error);
            // TODO: Add error handling/notification
        }
    };

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Typography variant="h4" sx={{ mb: 3 }}>My Books</Typography>
                <button 
                    onClick={() => setOpenModal(true)}
                    className="h-10 px-4 bg-socratic hover:bg-socratic-dark text-socratic-fontlight rounded"
                >
                    Create New Book
                </button>
            </div>
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
                                        {book.created_at ? new Date(book.created_at).toLocaleDateString() : 'Just now'}
                                    </TableCell>
                                    <TableCell>
                                        {book.updated_at ? new Date(book.updated_at).toLocaleDateString() : 'Just now'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <CreateBookModal 
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSubmit={handleCreateBook}
            />
        </div>
    );
};

export default Books;
