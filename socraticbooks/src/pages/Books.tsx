// src/pages/Books.tsx
import { useAppSelector } from '../hooks/redux';

export const Books = () => {
  // This will get our books array from the state
  const books = useAppSelector((state) => state.books.books);

  return (
    <div>
      <h1>My Books</h1>
      {books.length === 0 ? (
        <p>No books yet!</p>
      ) : (
        <ul>
          {books.map(book => (
            <li key={book.id}>{book.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};