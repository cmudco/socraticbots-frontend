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

interface NewChapter {
  title: string;
  subject: string;
  topic: string;
}

export const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [newChapter, setNewChapter] = useState<NewChapter>({
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

  // Fetch book details and chapters
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid || !id) return;

      // Fetch book details
      dispatch(fetchBooksStart());
      try {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/books/${id}?userId=${user.uid}`
        );
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch book');
        }
        
        const data = await response.json();
        dispatch(fetchBooksSuccess([data]));
      } catch (err) {
        dispatch(fetchBooksFailure(
          err instanceof Error ? err.message : 'Failed to fetch book'
        ));
        return; // Don't fetch chapters if book fetch failed
      }

      // Fetch chapters for this book
      dispatch(fetchChaptersStart());
      try {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/books/${id}/chapters?userId=${user.uid}`
        );
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch chapters');
        }
        
        const data = await response.json();
        dispatch(fetchChaptersSuccess(data || [])); // Ensure we always have an array
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
    
    if (!user?.uid || !id || !newChapter.title.trim()) {
      return;
    }

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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create chapter');
      }

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

  if (bookLoading) return <div className="p-6">Loading book details...</div>;
  if (bookError) return <div className="p-6 text-red-500">Error: {bookError}</div>;
  if (!book) return <div className="p-6">Book not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Book Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
        <p className="text-gray-600 mb-4">{book.description}</p>
        <div className="text-sm text-gray-500">
          <p><b>Created:</b> {new Date(book.created_at).toLocaleString()}</p>
          <p><b>Last Updated:</b> {new Date(book.updated_at).toLocaleString()}</p>
        </div>
      </div>

      {/* Add Chapter Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Chapter</h2>
        <form onSubmit={handleCreateChapter} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              value={newChapter.title}
              onChange={(e) => setNewChapter(prev => ({...prev, title: e.target.value}))}
              placeholder="Enter chapter title"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={chapterLoading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject (optional)
            </label>
            <input
              type="text"
              value={newChapter.subject}
              onChange={(e) => setNewChapter(prev => ({...prev, subject: e.target.value}))}
              placeholder="Enter subject"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={chapterLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic (optional)
            </label>
            <input
              type="text"
              value={newChapter.topic}
              onChange={(e) => setNewChapter(prev => ({...prev, topic: e.target.value}))}
              placeholder="Enter topic"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={chapterLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={chapterLoading || !newChapter.title.trim()}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     transition duration-200"
          >
            {chapterLoading ? 'Creating Chapter...' : 'Create Chapter'}
          </button>
        </form>
      </div>

      {/* Chapters List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Chapters</h2>
        {chapterError && (
          <div className="text-red-500 p-4 mb-4 bg-red-50 rounded">
            Error: {chapterError}
          </div>
        )}
        
        {chapterLoading ? (
          <div className="text-gray-500">Loading chapters...</div>
        ) : chapters?.length === 0 ? (
          <div className="text-gray-500">No chapters yet!</div>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <div 
                key={chapter.id}
                onClick={() => handleChapterClick(chapter.id)}
                className="p-4 border rounded hover:bg-gray-50 cursor-pointer
                         transition duration-200 transform hover:scale-[1.01]"
              >
                <h3 className="font-semibold text-lg">{chapter.title}</h3>
                <div className="mt-2 space-y-1">
                  {chapter.subject && (
                    <p className="text-gray-600">
                      <span className="font-medium">Subject:</span> {chapter.subject}
                    </p>
                  )}
                  {chapter.topic && (
                    <p className="text-gray-600">
                      <span className="font-medium">Topic:</span> {chapter.topic}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Created: {new Date(chapter.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};