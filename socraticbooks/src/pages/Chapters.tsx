import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import ChatButton from '../components/chat/ChatButton';
import {
  fetchChaptersStart,
  fetchChaptersSuccess,
  fetchChaptersFailure
} from '../store/slices/chaptersSlice';

interface Chapter {
  id: string;
  title: string;
  subject: string | null;
  topic: string | null;
  book_id: string;
  user_id: string;
  created_at: string;
  book_title: string; // Will come from the joined book data
}

interface RootState {
  chapters: {
    chapters: Chapter[];
    loading: boolean;
    error: string | null;
  };
}

export const Chapters = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  
  const { chapters, loading, error } = useSelector(
    (state: RootState) => state.chapters
  );

  useEffect(() => {
    const fetchChapters = async () => {
      if (!user?.uid) return;

      dispatch(fetchChaptersStart());
      try {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/chapters?userId=${user.uid}`
        );

        if (!response.ok) throw new Error('Failed to fetch chapters');

        const data = await response.json();
        dispatch(fetchChaptersSuccess(data));
      } catch (err) {
        dispatch(fetchChaptersFailure(
          err instanceof Error ? err.message : 'Failed to fetch chapters'
        ));
      }
    };

    fetchChapters();
  }, [dispatch, user]);

  const handleChapterClick = (bookId: string, chapterId: string) => {
    navigate(`/books/${bookId}/chapters/${chapterId}`);
  };

  if (loading) return <div>Loading chapters...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="books-container">
      <h1>My Chapters</h1>
      {chapters.length === 0 ? (
        <p>No chapters yet!</p>
      ) : (
        <div className="table-container">
          <table className="books-table">
            <thead>
              <tr><th>Chapter Name</th><th>Subject</th><th>Topic</th><th>Book Name</th><th>Created At</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr 
                  key={chapter.id} 
                  onClick={() => handleChapterClick(chapter.book_id, chapter.id)} 
                  className="book-row"
                ><td>{chapter.title}</td><td>{chapter.subject || '-'}</td><td>{chapter.topic || '-'}</td><td>{chapter.book_title}</td><td>{new Date(chapter.created_at).toLocaleString()}</td><td onClick={e => e.stopPropagation()}><ChatButton chapterId={chapter.id} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};