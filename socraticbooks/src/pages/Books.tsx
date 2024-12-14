// src/pages/Books.tsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { addBookStart, addBookSuccess, addBookFailure } from '../store/slices/booksSlice';
import './Books.css';

interface RootState {
  books: {
    books: any[];
    loading: boolean;
    error: string | null;
  }
}

export const Books = () => {
  const dispatch = useDispatch();
  const { books, loading, error } = useSelector((state: RootState) => state.books);
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) {
      console.error('No user ID found');
      return;
    }

    dispatch(addBookStart());

    try {
      const response = await fetch('https://dare.hss.cmu.edu/api/socratic-books/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          userId: user.uid
        })
      });

      if (!response.ok) throw new Error('Failed to add book');

      const data = await response.json();
      dispatch(addBookSuccess(data));
      setTitle('');
      setDescription('');
    } catch (err) {
      dispatch(addBookFailure(err instanceof Error ? err.message : 'Failed to add book'));
    }
  };

  return (
    <div className="books-container">
      <h1>My Books</h1>

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book title"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Book description"
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Book'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {books.length === 0 ? (
        <p>No books yet!</p>
      ) : (
        <ul className="books-list">
          {books.map((book) => (
            <li key={book.id} className="book-item">
              <h3>{book.title}</h3>
              <p>{book.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};