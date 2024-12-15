import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Interfaces and Types
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
  created_at: string;
  updated_at: string;
}

interface DefaultOptions {
  teachingStyle: {
    [key: string]: string;
  };
}

type EditableField = {
  field: 'title' | 'subject' | 'topic' | 'greeting' | 'teaching_style' | 'qa_instructions' | 'restrictions';
  value: string;
}

// Default Options Configuration
const defaultOptions: DefaultOptions = {
  teachingStyle: {
    'Conversation Style': 'You are a friendly conversational tutor who guides students through natural dialogue, using everyday language and relatable examples. Encourage open discussion and make the learning experience comfortable and engaging.',
    'Academic Style': 'You are a formal academic tutor who maintains professional discourse. Use precise terminology, cite relevant concepts, and maintain a structured approach to learning. Focus on accuracy and depth of understanding.',
    'Socratic Method': 'You primarily ask thought-provoking questions to guide students to their own understanding. Each response should include questions that help students examine their assumptions and discover key insights independently.'
  }
};

// Learning Goals Component
const LearningGoalsSection = ({ chapterId, userId }: { chapterId: string; userId: string }) => {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGoalText, setNewGoalText] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchGoals();
  }, [chapterId]);

  const fetchGoals = async () => {
    try {
      const response = await fetch(
        `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}/learning-goals?userId=${userId}`
      );
      if (!response.ok) throw new Error('Failed to fetch learning goals');
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch learning goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    try {
      const response = await fetch(
        `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}/learning-goals?userId=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newGoalText.trim() })
        }
      );

      if (!response.ok) throw new Error('Failed to add learning goal');

      const newGoal = await response.json();
      setGoals([...goals, newGoal]);
      setNewGoalText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add learning goal');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this learning goal?')) return;

    try {
      const response = await fetch(
        `https://dare.hss.cmu.edu/api/socratic-books/learning-goals/${goalId}?userId=${userId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete learning goal');

      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete learning goal');
    }
  };

  const handleUpdateGoal = async (goalId: string) => {
    if (!editText.trim()) return;

    try {
      const response = await fetch(
        `https://dare.hss.cmu.edu/api/socratic-books/learning-goals/${goalId}?userId=${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: editText.trim() })
        }
      );

      if (!response.ok) throw new Error('Failed to update learning goal');

      const updatedGoal = await response.json();
      setGoals(goals.map(goal => goal.id === goalId ? updatedGoal : goal));
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update learning goal');
    }
  };

  if (loading) return <div>Loading learning goals...</div>;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Learning Goals</h3>
      
      <form onSubmit={handleAddGoal} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="Enter new learning goal"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={!newGoalText.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Add Goal
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={goal.id} className="p-4 border rounded">
            {editing === goal.id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="space-x-2">
                  <button
                    onClick={() => handleUpdateGoal(goal.id)}
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
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-medium">LG{index + 1})</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setEditing(goal.id);
                        setEditText(goal.text);
                      }}
                      className="action-button edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="action-button delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2">{goal.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Component
export const ChapterDetail = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const { user } = useAuth();
  
  // State Management
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [tempValue, setTempValue] = useState('');

  // Data Fetching
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

      // Fetch chapter details - using the new endpoint
      const chapterResponse = await fetch(
        `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}?userId=${user.uid}`
      );
      
      if (!chapterResponse.ok) throw new Error('Failed to fetch chapter');
      const chapterData = await chapterResponse.json();
      setChapter(chapterData);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
};

  // Event Handlers
  const handleEdit = (field: EditableField['field'], value: string) => {
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
            greeting: editing.field === 'greeting' ? tempValue : chapter.greeting,
            teaching_style: editing.field === 'teaching_style' ? tempValue : chapter.teaching_style,
            qa_instructions: editing.field === 'qa_instructions' ? tempValue : chapter.qa_instructions,
            restrictions: editing.field === 'restrictions' ? tempValue : chapter.restrictions
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

  // Render Helper Functions
  const renderEditField = (field: EditableField['field']) => {
    if (editing?.field === field) {
      if (['greeting', 'teaching_style', 'qa_instructions', 'restrictions'].includes(field)) {
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

    const value = chapter?.[field];
    if (['greeting', 'teaching_style', 'qa_instructions', 'restrictions'].includes(field)) {
      return value ? `${value.substring(0, 50)}...` : '-';
    }
    return value || '-';
  };

  const getFieldDisplayName = (field: string): string => {
    const displayNames: { [key: string]: string } = {
      'title': 'Title',
      'subject': 'Subject',
      'topic': 'Topic',
      'greeting': 'Greeting',
      'teaching_style': 'Teaching Style',
      'qa_instructions': 'Q&A Instructions',
      'restrictions': 'Restrictions'
    };
    return displayNames[field] || field;
  };

  // Loading and Error States
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!chapter || !book) return <div className="p-6">Chapter not found</div>;

  // Main Render
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">{chapter.title}</h2>
      <h3 className="text-lg text-gray-600 mb-6">{book.title}</h3>

      {/* Add Learning Goals Section */}
      {chapter && user && (
        <LearningGoalsSection chapterId={chapter.id} userId={user.uid} />
      )}

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
            {(['title', 'subject', 'topic', 'greeting', 'teaching_style', 'qa_instructions', 'restrictions'] as const).map((field) => (
              <tr key={field}>
                <td className="font-medium">{getFieldDisplayName(field)}</td>
                <td className={['greeting', 'teaching_style', 'qa_instructions', 'restrictions'].includes(field) && editing?.field === field ? 'p-0' : ''}>
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