import React, { useEffect, useState } from 'react';
import { Book } from '../../services/booksService';
import { useAuthContext } from '../../contexts/AuthContext';
import BooksHeader from './BooksHeader/BooksHeader';
import BooksList from './BooksList/BooksList';
import { getBooks, createBook, deleteBook, updateBook } from '../../services/booksService';
import  CreateBookModal  from '../modals/CreateBookModal';
import  EditBookModal  from '../modals/EditBookModal';

const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const user = useAuthContext();

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

    if (!user) return <div>Please log in to view your books.</div>;
    if (loading) return <div>Loading your books...</div>;

    return (
        <div className="p-5">
            <BooksHeader 
                onCreateClick={() => setOpenModal(true)} 
            />
            
            <BooksList 
                books={books}
                onEditBook={(book) => {
                    setSelectedBook(book);
                    setOpenEditModal(true);
                }}
                onDeleteBook={handleDeleteBook}
            />

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
