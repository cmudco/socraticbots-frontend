import axios from 'axios';
import { getAuth } from 'firebase/auth';

export interface LearningGoal {
    id: string;
    chapter_id: string;
    text: string;
    display_order: number;
    created_at: string;
    updated_at: string;
}

const BASE_URL = 'https://dare.hss.cmu.edu/api/socratic-books';

export const getLearningGoals = async (chapterId: string): Promise<LearningGoal[]> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const response = await axios.get(
        `${BASE_URL}/chapters/${chapterId}/learning-goals`,
        {
            params: { userId: user.uid }
        }
    );

    return response.data;
};

export const createLearningGoal = async (
    chapterId: string, 
    data: { text: string }
): Promise<LearningGoal> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const response = await axios.post(
        `${BASE_URL}/chapters/${chapterId}/learning-goals`,
        data,
        {
            params: { userId: user.uid }
        }
    );

    return response.data;
};

export const updateLearningGoal = async (
    goalId: string,
    data: { text: string }
): Promise<LearningGoal> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const response = await axios.put(
        `${BASE_URL}/learning-goals/${goalId}`,
        data,
        {
            params: { userId: user.uid }
        }
    );

    return response.data;
};

export const deleteLearningGoal = async (goalId: string): Promise<void> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await axios.delete(
        `${BASE_URL}/learning-goals/${goalId}`,
        {
            params: { userId: user.uid }
        }
    );
};
