import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Chapter {
  id: string;
  title: string;
  subject: string | null;
  topic: string | null;
  greeting: string | null;
  teaching_style: string | null;
  qa_instructions: string | null;
  restrictions: string | null;
  book_id: string;
}

interface Book {
  id: string;
  title: string;
}

interface LearningGoal {
  id: string;
  chapter_id: string;
  text: string;
  display_order: number;
}

interface DefaultOptions {
  teachingStyle: {
    [key: string]: string;
  };
}

type ChapterField = keyof Omit<Chapter, 'id' | 'book_id'>;
type LearningGoalField = 'lg1' | 'lg2' | 'lg3' | 'lg4' | 'lg5' | 'lg6' | 'lg7' | 'lg8';
type EditableField = ChapterField | LearningGoalField;

const defaultOptions: DefaultOptions = {
  teachingStyle: {
    'Conversation Style': 'You are a friendly conversational tutor who guides students through natural dialogue, using everyday language and relatable examples. Encourage open discussion and make the learning experience comfortable and engaging.',
    'Academic Style': 'You are a formal academic tutor who maintains professional discourse. Use precise terminology, cite relevant concepts, and maintain a structured approach to learning. Focus on accuracy and depth of understanding.',
    'Socratic Method': 'You primarily ask thought-provoking questions to guide students to their own understanding. Each response should include questions that help students examine their assumptions and discover key insights independently.'
  }
};

export const ChapterDetail = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const { user } = useAuth();
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [learningGoals, setLearningGoals] = useState<Record<number, LearningGoal>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ field: EditableField; value: string } | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    fetchData();
  }, [bookId, chapterId, user]);

  const fetchData = async () => {
    if (!user?.uid || !bookId || !chapterId) return;

    try {
      const [bookResponse, chapterResponse, goalsResponse] = await Promise.all([
        fetch(`https://dare.hss.cmu.edu/api/socratic-books/books/${bookId}?userId=${user.uid}`),
        fetch(`https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}?userId=${user.uid}`),
        fetch(`https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}/learning-goals?userId=${user.uid}`)
      ]);
      
      if (!bookResponse.ok || !chapterResponse.ok) throw new Error('Failed to fetch data');
      
      const [bookData, chapterData, goalsData] = await Promise.all([
        bookResponse.json(),
        chapterResponse.json(),
        goalsResponse.json()
      ]);

      setBook(bookData);
      setChapter(chapterData);

      const goalsMap: Record<number, LearningGoal> = {};
      if (Array.isArray(goalsData)) {
        goalsData.forEach(goal => {
          goalsMap[goal.display_order] = goal;
        });
      }
      setLearningGoals(goalsMap);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleEdit = (field: EditableField, value: string) => {
    setEditing({ field, value });
    setTempValue(value || '');
  };

  const handleStyleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStyle = e.target.value;
    if (selectedStyle && defaultOptions.teachingStyle[selectedStyle]) {
      setTempValue(defaultOptions.teachingStyle[selectedStyle]);
    }
  };

  const handleSave = async () => {
    if (!editing || !chapter || !user?.uid) return;

    try {
      if (editing.field.startsWith('lg')) {
        const displayOrder = parseInt(editing.field.slice(2));
        const existingGoal = learningGoals[displayOrder];

        if (!tempValue.trim()) {
          if (existingGoal) {
            const response = await fetch(
              `https://dare.hss.cmu.edu/api/socratic-books/learning-goals/${existingGoal.id}?userId=${user.uid}`,
              { method: 'DELETE' }
            );
            if (response.ok) {
              const newGoals = { ...learningGoals };
              delete newGoals[displayOrder];
              setLearningGoals(newGoals);
            }
          }
        } else if (existingGoal) {
          const response = await fetch(
            `https://dare.hss.cmu.edu/api/socratic-books/learning-goals/${existingGoal.id}?userId=${user.uid}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: tempValue })
            }
          );
          
          if (response.ok) {
            const updatedGoal = await response.json();
            setLearningGoals(prev => ({ ...prev, [displayOrder]: updatedGoal }));
          }
        } else {
          const response = await fetch(
            `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}/learning-goals?userId=${user.uid}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: tempValue })
            }
          );
          
          if (response.ok) {
            const newGoal = await response.json();
            setLearningGoals(prev => ({ ...prev, [displayOrder]: newGoal }));
          }
        }
      } else {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapter.id}?userId=${user.uid}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...chapter,
              [editing.field]: tempValue
            })
          }
        );

        if (response.ok) {
          const updatedChapter = await response.json();
          setChapter(updatedChapter);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setEditing(null);
    }
  };

  const renderEditField = (field: EditableField) => {
    if (editing?.field === field) {
      if (['greeting', 'teaching_style', 'qa_instructions', 'restrictions'].includes(field) || field.startsWith('lg')) {
        return (
          <div className="space-y-2">
            {field === 'teaching_style' && (
              <select 
                onChange={handleStyleSelect}
                className="w-full p-2 border rounded mb-2"
              >
                <option value="">Select a default style...</option>
                {Object.keys(defaultOptions.teachingStyle).map(style => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            )}
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full p-2 border rounded min-h-[200px]"
              autoFocus
            />
          </div>
        );
      }
      return (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="w-full p-2 border rounded"
          autoFocus
        />
      );
    }

    if (field.startsWith('lg')) {
      const displayOrder = parseInt(field.slice(2));
      const goal = learningGoals[displayOrder];
      return goal?.text || '-';
    }

    const value = chapter?.[field as ChapterField];
    if (['greeting', 'teaching_style', 'qa_instructions', 'restrictions'].includes(field)) {
      return value ? `${value.substring(0, 50)}...` : '-';
    }
    return value || '-';
  };

  const getFieldDisplayName = (field: EditableField): string => {
    if (field.startsWith('lg')) {
      return `Learning Goal ${field.slice(2)}`;
    }

    const displayNames: Record<ChapterField, string> = {
      title: 'Title',
      subject: 'Subject',
      topic: 'Topic',
      greeting: 'Greeting',
      teaching_style: 'Teaching Style',
      qa_instructions: 'Q&A Instructions',
      restrictions: 'Restrictions'
    };
    
    return displayNames[field as ChapterField];
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!chapter || !book) return <div className="p-6">Chapter not found</div>;

  const allFields: EditableField[] = [
    'title', 'subject', 'topic', 'greeting', 'teaching_style', 
    'qa_instructions', 'restrictions', 
    'lg1', 'lg2', 'lg3', 'lg4', 'lg5', 'lg6', 'lg7', 'lg8'
  ];

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
            {allFields.map((field) => (
              <tr key={field}>
                <td className="font-medium">{getFieldDisplayName(field)}</td>
                <td className={['greeting', 'teaching_style', 'qa_instructions', 'restrictions'].includes(field) || field.startsWith('lg') ? 'p-0' : ''}>
                  {renderEditField(field)}
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
                      onClick={() => {
                        if (field.startsWith('lg')) {
                          const displayOrder = parseInt(field.slice(2));
                          handleEdit(field, learningGoals[displayOrder]?.text || '');
                        } else {
                          handleEdit(field, chapter[field as ChapterField] || '');
                        }
                      }}
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

export default ChapterDetail;