// src/pages/Books.tsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import { 
 addBookStart, 
 addBookSuccess, 
 addBookFailure,
 fetchBooksStart,
 fetchBooksSuccess, 
 fetchBooksFailure 
} from '../store/slices/booksSlice';
import './Books.css';

interface RootState {
 books: {
   books: any[];
   loading: boolean;
   error: string | null;
 }
}

export const Books = () => {
 const navigate = useNavigate();
 const dispatch = useDispatch();
 const { books, loading, error } = useSelector((state: RootState) => state.books);
 const { user } = useAuth();

 const handleRowClick = (bookId: string) => {
  navigate(`/books/${bookId}`);
 };

 const handleEdit = (e: React.MouseEvent, bookId: string) => {
  e.stopPropagation(); // Prevent row click when clicking button
  // TODO: Implement edit functionality
  console.log('Edit book:', bookId);
};

const handleDelete = (e: React.MouseEvent, bookId: string) => {
  e.stopPropagation(); // Prevent row click when clicking button
  // TODO: Implement delete functionality
  console.log('Delete book:', bookId);
};

 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');

 useEffect(() => {
   const fetchBooks = async () => {
     if (!user?.uid) return;
     
     dispatch(fetchBooksStart());
     try {
       const response = await fetch(
         `https://dare.hss.cmu.edu/api/socratic-books/books?userId=${user.uid}`
       );
       
       if (!response.ok) throw new Error('Failed to fetch books');
       
       const data = await response.json();
       dispatch(fetchBooksSuccess(data));
     } catch (err) {
       dispatch(fetchBooksFailure(
         err instanceof Error ? err.message : 'Failed to fetch books'
       ));
     }
   };

   fetchBooks();
 }, [dispatch, user]);

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

     const data = await response.json();
     
     if (!response.ok) {
       throw new Error(data.error || 'Failed to add book');
     }

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
        <div className="table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Book Name</th>
                <th>Description</th>
                <th>ID</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr 
                  key={book.id} 
                  onClick={() => handleRowClick(book.id)}
                  className="book-row"
                >
                  <td>{book.title}</td>
                  <td>{book.description}</td>
                  <td className="id-cell">{book.id}</td>
                  <td>{new Date(book.created_at).toLocaleString()}</td>
                  <td className="actions-cell">
                    <button 
                      onClick={(e) => handleEdit(e, book.id)}
                      className="action-button edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, book.id)}
                      className="action-button delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};