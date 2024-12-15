import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Chapter {
  id: string;
  title: string;
  subject: string | null;
  topic: string | null;
  book_id: string;
}

interface Book {
  id: string;
  title: string;
}

interface EditableField {
  field: 'title' | 'subject' | 'topic';
  value: string;
}

export const ChapterDetail = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const { user } = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    fetchData();
  }, [bookId, chapterId, user]);

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

  const handleEdit = (field: 'title' | 'subject' | 'topic', value: string) => {
    setEditing({ field, value });
    setTempValue(value || '');
  };

  const handleSave = async () => {
    if (!editing || !chapter || !user?.uid) return;

    try {
      const response = await fetch(
        `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}?userId=${user.uid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editing.field === 'title' ? tempValue : chapter.title,
            subject: editing.field === 'subject' ? tempValue : chapter.subject,
            topic: editing.field === 'topic' ? tempValue : chapter.topic,
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update chapter');

      const updatedChapter = await response.json();
      setChapter(updatedChapter);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chapter');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!chapter || !book) return <div className="p-6">Chapter not found</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">{chapter.title}</h2>
      <h3 className="text-lg text-gray-600 mb-6">{book.title}</h3>

      <div className="table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(['title', 'subject', 'topic'] as const).map((field) => (
              <tr key={field}>
                <td className="font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</td>
                <td>
                  {editing?.field === field ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full p-2 border rounded"
                      autoFocus
                    />
                  ) : (
                    chapter[field] || '-'
                  )}
                </td>
                <td>
                  {editing?.field === field ? (
                    <div className="space-x-2">
                      <button
                        onClick={handleSave}
                        className="action-button edit"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="action-button delete"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(field, chapter[field] || '')}
                      className="action-button edit"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};