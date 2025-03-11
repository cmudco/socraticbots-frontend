// src/pages/Books.tsx
import React, { useEffect, useState } from 'react';
import { useBookService } from '../services/books.service';
import { Book } from '../types/book';
import BookTable from '../components/books/BookTable';
import BookListEmpty from '../components/books/BookListEmpty';

const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    
    // Use the book service hook directly
    const bookService = useBookService();
    
    // Fetch books on initial render
    useEffect(() => {
        if (!hasFetched) {
            const fetchBooks = async () => {
                try {
                    setLoading(true);
                    const fetchedBooks = await bookService.getBooks();
                    setBooks(fetchedBooks);
                    console.log('Fetched books:', fetchedBooks);
                    setError(null);
                } catch (err) {
                    setError('Could not load books. Please try again later.');
                    console.error('Error loading books:', err);
                } finally {
                    setLoading(false);
                    setHasFetched(true);
                }
            };
            
            fetchBooks();
        }
    }, [hasFetched, bookService]);
    
    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-4">Loading books...</div>;
        }
        
        if (error) {
            return <div className="text-center p-4 text-red-500">{error}</div>;
        }
        
        if (books.length === 0) {
            return <BookListEmpty />;
        }
        
        return <BookTable books={books} />;
    };
    
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Books</h1>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Create New Book
                </button>
            </div>
            
            {renderContent()}
        </div>
    );
};

export default Books;
