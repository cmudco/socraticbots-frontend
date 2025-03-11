// src/pages/Books.tsx
import React, { useEffect, useState } from 'react';
import { useBookService } from '../services/books.service';
import { Book } from '../types/book';

const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    
    // Use the book service hook directly
    const bookService = useBookService();
    
    useEffect(() => {
        // Only fetch once
        if (!hasFetched) {
            const fetchBooks = async () => {
                try {
                    setLoading(true);
                    const fetchedBooks = await bookService.getBooks();
                    setBooks(fetchedBooks);
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
    
    if (loading) {
        return <div className="text-center p-4">Loading books...</div>;
    }
    
    if (error) {
        return <div className="text-center p-4 text-red-500">{error}</div>;
    }
    
    if (books.length === 0) {
        return (
            <div className="p-4">
                <h1 className="text-3xl font-bold mb-4">Books</h1>
                <p>You don't have any books yet.</p>
            </div>
        );
    }
    
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">Books</h1>
            <div className="grid gap-4">
                {books.map(book => (
                    <div key={book.id} className="border p-4 rounded-lg">
                        <h2 className="text-xl font-semibold">{book.title}</h2>
                        {book.description && <p className="mt-2">{book.description}</p>}
                        <p className="text-sm text-gray-500 mt-2">
                            Created: {new Date(book.created_at).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Books;
