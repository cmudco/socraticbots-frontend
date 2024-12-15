import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Chapter {
  id: string;
  title: string;
  book_id: string;
}

interface Book {
  id: string;
  title: string;
}

export const ChapterDetail = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const { user } = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid || !bookId || !chapterId) return;

      try {
        // Fetch book details
        const bookResponse = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/books/${bookId}?userId=${user.uid}`
        );
        
        if (!bookResponse.ok) throw new Error('Failed to fetch book');
        const bookData = await bookResponse.json();
        setBook(bookData);

        // Fetch chapter details
        const chapterResponse = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/books/${bookId}/chapters?userId=${user.uid}`
        );
        
        if (!chapterResponse.ok) throw new Error('Failed to fetch chapter');
        const chaptersData = await chapterResponse.json();
        const currentChapter = chaptersData.find((ch: Chapter) => ch.id === chapterId);
        
        if (!currentChapter) throw new Error('Chapter not found');
        setChapter(currentChapter);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, chapterId, user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!chapter || !book) return <div className="p-6">Chapter not found</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">{chapter.title}</h2>
      <p className="">{book.title}</p>
    </div>
  );
};