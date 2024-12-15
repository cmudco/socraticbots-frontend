import { useParams } from 'react-router-dom';

export const ChapterDetail = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Chapter Detail</h1>
      <p>Book ID: {bookId}</p>
      <p>Chapter ID: {chapterId}</p>
    </div>
  );
};