import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchBooksStart,
  fetchBooksSuccess,
  fetchBooksFailure 
} from '../store/slices/booksSlice';
import {
  fetchChaptersStart,
  fetchChaptersSuccess,
  fetchChaptersFailure,
  addChapterStart,
  addChapterSuccess,
  addChapterFailure
} from '../store/slices/chaptersSlice';
import './Books.css';  // Reuse the same CSS file

interface Book {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Chapter {
  id: string;
  title: string;
  subject: string | null;
  topic: string | null;
  book_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface RootState {
  books: {
    books: Book[];
    loading: boolean;
    error: string | null;
  };
  chapters: {
    chapters: Chapter[];
    loading: boolean;
    error: string | null;
  };
}

export const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [newChapter, setNewChapter] = useState({
    title: '',
    subject: '',
    topic: ''
  });

  const { books, loading: bookLoading, error: bookError } = useSelector(
    (state: RootState) => state.books
  );
  const { chapters, loading: chapterLoading, error: chapterError } = useSelector(
    (state: RootState) => state.chapters
  );

  const book = books.find(b => b.id === id);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid || !id) return;

      // Fetch book details
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

      // Fetch chapters
      dispatch(fetchChaptersStart());
      try {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/books/${id}/chapters?userId=${user.uid}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch chapters');
        
        const data = await response.json();
        dispatch(fetchChaptersSuccess(data || []));
      } catch (err) {
        dispatch(fetchChaptersFailure(
          err instanceof Error ? err.message : 'Failed to fetch chapters'
        ));
      }
    };

    fetchData();
  }, [dispatch, id, user]);

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid || !id || !newChapter.title.trim()) return;

    dispatch(addChapterStart());

    try {
      const response = await fetch(
        'https://dare.hss.cmu.edu/api/socratic-books/chapters',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newChapter.title.trim(),
            subject: newChapter.subject.trim() || null,
            topic: newChapter.topic.trim() || null,
            bookId: id,
            userId: user.uid
          })
        }
      );

      if (!response.ok) throw new Error('Failed to create chapter');

      const data = await response.json();
      dispatch(addChapterSuccess(data));
      setNewChapter({ title: '', subject: '', topic: '' });
    } catch (err) {
      dispatch(addChapterFailure(
        err instanceof Error ? err.message : 'Failed to create chapter'
      ));
    }
  };

  const handleChapterClick = (chapterId: string) => {
    navigate(`/books/${id}/chapters/${chapterId}`);
  };

  if (bookLoading) return <div>Loading book details...</div>;
  if (bookError) return <div className="error">{bookError}</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="books-container">
      <div className="mb-8">
        <h1>{book.title}</h1>
        <p>{book.description}</p>
        <p className="text-sm text-gray-500">
          <b>Created:</b> {new Date(book.created_at).toLocaleString()}
        </p>
      </div>

      {/* Add Chapter Form */}
      <form onSubmit={handleCreateChapter} className="book-form">
        <div className="form-group">
          <input
            type="text"
            value={newChapter.title}
            onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
            placeholder="Chapter title"
            disabled={chapterLoading}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            value={newChapter.subject}
            onChange={(e) => setNewChapter({...newChapter, subject: e.target.value})}
            placeholder="Subject (optional)"
            disabled={chapterLoading}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            value={newChapter.topic}
            onChange={(e) => setNewChapter({...newChapter, topic: e.target.value})}
            placeholder="Topic (optional)"
            disabled={chapterLoading}
          />
        </div>
        <button type="submit" disabled={chapterLoading}>
          {chapterLoading ? 'Adding...' : 'Add Chapter'}
        </button>
      </form>

      {chapterError && <p className="error">{chapterError}</p>}

      {/* Chapters Table */}
      {chapters?.length === 0 ? (
        <p>No chapters yet!</p>
      ) : (
        <div className="table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Chapter Name</th>
                <th>Subject</th>
                <th>Topic</th>
                <th>Created At</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr 
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter.id)}
                  className="book-row"
                >
                  <td>{chapter.title}</td>
                  <td>{chapter.subject || '-'}</td>
                  <td>{chapter.topic || '-'}</td>
                  <td>{new Date(chapter.created_at).toLocaleString()}</td>
                  <td className="id-cell">{chapter.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};