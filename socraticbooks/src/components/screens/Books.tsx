// src/components/Books.tsx
import React, { useEffect, useState } from 'react';
import { getBooks, Book, createBook, deleteBook, updateBook } from '../../services/booksService';
import { useAuthContext } from '../../contexts/AuthContext';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper} from '@mui/material';
import { Typography } from '@mui/material';
import CreateBookModal from '../modals/CreateBookModal';
import EditBookModal from '../modals/EditBookModal';

const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const user = useAuthContext();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [openEditModal, setOpenEditModal] = useState(false);

    const handleCreateBook = async (title: string, description: string) => {
        try {
            if (user?.uid) {
                const createdBook = await createBook(user.uid, title, description);
                setBooks([createdBook, ...books]);
                setOpenModal(false);
            }
        } catch (error) {
            console.error('Error creating book:', error);
        }
    };

    const handleDeleteBook = async (bookId: string) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                if (user?.uid) {
                    await deleteBook(user.uid, bookId);
                    setBooks(books.filter(book => book.id !== bookId));
                }
            } catch (error) {
                console.error('Error deleting book:', error);
            }
        }
    };

    const handleUpdateBook = async (bookId: string, title: string, description: string) => {
        try {
            if (user?.uid) {
                const updatedBook = await updateBook(user.uid, bookId, { title, description });
                setBooks(books.map(book => 
                    book.id === bookId ? updatedBook : book
                ));
                setOpenEditModal(false);
                setSelectedBook(null);
            }
        } catch (error) {
            console.error('Error updating book:', error);
        }
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                if (user?.uid) {
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
                    className="h-10 px-4 bg-socratic hover:bg-socratic-dark text-socratic-font-light rounded transition-colors"
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
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {books.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
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
                                    <TableCell>
                                        <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                setSelectedBook(book);
                                                setOpenEditModal(true);
                                            }}
                                            className="bg-socratic hover:bg-socratic-dark text-socratic-font-light font-bold py-1 px-3 rounded text-sm transition-colors"
                                        >
                                            Edit
                                        </button>
                                            <button 
                                                onClick={() => handleDeleteBook(book.id)}
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
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

            <EditBookModal 
                    open={openEditModal}
                    book={selectedBook}
                    onClose={() => {
                        setOpenEditModal(false);
                        setSelectedBook(null);
                    }}
                    onSubmit={handleUpdateBook}
            />
        </div>
    );
};

export default Books;
