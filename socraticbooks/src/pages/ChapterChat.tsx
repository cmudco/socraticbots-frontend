// src/pages/ChapterChat.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ChapterChat from '../components/chat/ChapterChat';
import { Chapter } from '../types/chapter';
import { useAuth } from '../contexts/AuthContext';

export const ChapterChatPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();  // Changed from currentUser to user
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(
          `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}?userId=${user?.uid}`, // Changed from currentUser to user
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch chapter');
        }

        const data = await response.json();
        setChapter(data);
      } catch (error) {
        console.error('Error fetching chapter:', error);
        navigate('/chapters');
      } finally {
        setLoading(false);
      }
    };

    if (chapterId && user?.uid) {  // Changed from currentUser to user
      fetchChapter();
    }
  }, [chapterId, user?.uid, navigate]);  // Changed from currentUser to user

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!chapter) {
    return <div>Chapter not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ChapterChat 
        chapter={chapter} 
        onBack={() => navigate('/chapters')} 
      />
    </div>
  );
};