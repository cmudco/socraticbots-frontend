import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { setupApi } from '../services/api';
import { Book } from '../types/book';

// Define a BookService class outside your component
class BookService {
  private readonly baseUrl = '/books';
  
  constructor(private apiClient: any) {}
  
  async getBooks(): Promise<Book[]> {
    try {
      const response = await this.apiClient.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }
}

const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Get auth context only once
    const auth = useAuth();
    
    // Use useCallback to memoize the fetch function
    const fetchBooks = useCallback(async () => {
        try {
            setLoading(true);
            
            // Create API client and service only when needed
            const apiClient = setupApi(auth);
            const bookService = new BookService(apiClient);
            
            const fetchedBooks = await bookService.getBooks();
            setBooks(fetchedBooks);
            setError(null);
        } catch (err) {
            setError('Could not load books. Please try again later.');
            console.error('Error loading books:', err);
        } finally {
            setLoading(false);
        }
    }, [auth]); // Only depends on auth, which shouldn't change frequently
    
    // Use the memoized function in useEffect
    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]); // Now this only re-runs when fetchBooks changes, which is only when auth changes
    
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
