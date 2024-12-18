import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ChapterChat from '../components/chat/ChapterChat';
import LearningGoalsTable from '../components/learning/LearningGoalsTable';
import { Chapter } from '../types/chapter';
import { useAuth } from '../contexts/AuthContext';

type LearningGoal = {
  id: string;
  text: string;
  display_order: number;
};

export const ChapterChatPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chapterResponse, goalsResponse] = await Promise.all([
          fetch(
            `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}?userId=${user?.uid}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          ),
          fetch(
            `https://dare.hss.cmu.edu/api/socratic-books/chapters/${chapterId}/learning-goals?userId=${user?.uid}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          ),
        ]);

        if (!chapterResponse.ok || !goalsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [chapterData, goalsData] = await Promise.all([
          chapterResponse.json(),
          goalsResponse.json(),
        ]);

        setChapter(chapterData);
        setLearningGoals(goalsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/chapters');
      } finally {
        setLoading(false);
      }
    };

    if (chapterId && user?.uid) {
      fetchData();
    }
  }, [chapterId, user?.uid, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chapter not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        <div className="flex-none">
          <LearningGoalsTable goals={learningGoals} />
        </div>
        <div className="flex-1">
          <ChapterChat
            chapter={chapter}
            onBack={() => navigate('/chapters')}
          />
        </div>
      </div>
    </div>
  );
};

export default ChapterChatPage;