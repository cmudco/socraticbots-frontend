// src/pages/Books.tsx
import React, { useEffect, useState } from 'react';
import { bookService } from '../services/books.service';
import { Book } from '../types/book';
import BookTable from '../components/books/BookTable';
import BookListEmpty from '../components/books/BookListEmpty';
import BookFormModal from '../components/books/BookFormModal';
import DeleteBookModal from '../components/books/DeleteBookModal';
import { chapterService } from '../services/chapters.service';
import { useAuth } from '../context/AuthContext';
import { useAppSelector } from '../store/hooks';

const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    // Get auth and API ready status
    const auth = useAuth();
    const apiReady = useAppSelector(state => state.api.isReady);
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    
    // Fetch books function
    const fetchBooks = async () => {
        try {
            setLoading(true);
            const fetchedBooks = await bookService.getBooks();
            setBooks(fetchedBooks);
            setError(null);

            // Test chapters API if we have books
            if (fetchedBooks.length > 0) {
                console.log("Testing chapters API for first book");
                chapterService.getChapters(fetchedBooks[0].id)
                  .then(data => console.log("Chapters data:", data))
                  .catch(err => console.log("Error:", err));
            }
        } catch (err) {
            setError('Could not load books. Please try again later.');
            console.error('Error loading books:', err);
        } finally {
            setLoading(false);
            setHasFetched(true);
        }
    };
    
    // Fetch books when conditions are met
    useEffect(() => {
        const shouldFetch = 
            !hasFetched && 
            !auth.isLoading && 
            auth.isAuthenticated && 
            apiReady;
            
        if (shouldFetch) {
            console.log("API is ready and auth is ready - fetching books");
            fetchBooks();
        }
    }, [hasFetched, auth.isLoading, auth.isAuthenticated, apiReady]);

    // Modal handlers
    const handleOpenCreateModal = () => {
        setSelectedBook(null); // Ensure no book is selected for create mode
        setIsFormModalOpen(true);
    };
    
    const handleOpenEditModal = (book: Book) => {
        setSelectedBook(book);
        setIsFormModalOpen(true);
    };
    
    
    
    const handleOpenDeleteModal = (book: Book) => {
        setSelectedBook(book);
        setIsDeleteModalOpen(true);
    };
    
    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
    };
    
    
    
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };
    
    const handleBookSuccess = () => {
        // Refresh the book list after creating/updating a book
        fetchBooks();
    };
    
    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-4">Loading books...</div>;
        }
        
        if (error) {
            return <div className="text-center p-4 text-red-500">{error}</div>;
        }
        
        if (books.length === 0) {
            return <BookListEmpty onCreateClick={handleOpenCreateModal} />;
        }
        
        return (
            <BookTable 
                books={books} 
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
            />
        );
    };
    
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">ChatBot Groups</h1>
                <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
                    onClick={handleOpenCreateModal}
                >
                    Create New ChatBot Group
                </button>
            </div>
            
            {renderContent()}

            {/* Create/Edit Book Modal */}
            <BookFormModal 
                isOpen={isFormModalOpen} 
                onClose={handleCloseFormModal} 
                onBookCreated={handleBookSuccess}
                book={selectedBook || undefined}
            />
            
            
            
            {/* Delete Confirmation Modal */}
            {selectedBook && (
                <DeleteBookModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onSuccess={handleBookSuccess}
                    book={selectedBook}
                />
            )}
        </div>
    );
};

export default Books;
