// src/pages/BookDetail.tsx
import { useParams } from 'react-router-dom';

export const BookDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="book-detail">
      <h1>Book Details</h1>
      <p>Book ID: {id}</p>
      {/* More details to come */}
    </div>
  );
};