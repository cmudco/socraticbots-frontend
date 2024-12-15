import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchBooksStart, 
  fetchBooksSuccess, 
  fetchBooksFailure 
} from '../store/slices/booksSlice';

interface RootState {
  books: {
    books: any[];
    loading: boolean;
    error: string | null;
  };
}

export const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { books, loading, error } = useSelector(
    (state: RootState) => state.books
  );

  const book = books.find(b => b.id === id);

  useEffect(() => {
    const fetchBookDetail = async () => {
      if (!user?.uid || !id) return;

      dispatch(fetchBooksStart());
      try {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/books/${id}?userId=${user.uid}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch book');
        
        const data = await response.json();
        dispatch(fetchBooksSuccess([data]));
      } catch (err) {
        dispatch(fetchBooksFailure(
          err instanceof Error ? err.message : 'Failed to fetch book'
        ));
      }
    };

    fetchBookDetail();
  }, [dispatch, id, user]);

  if (loading) return <div>Loading book details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
        <p className="text-gray-600 mb-2">{book.description}</p>
        <br></br>
        <p className="text-sm text-gray-500"><b>Created:</b> {new Date(book.created_at).toLocaleString()}</p>
        <p><b>Updated:</b> {book.updated_at}</p>
      </div>
    </div>
  );
};