// src/services/chaptersService.ts
import axios from 'axios';

const API_BASE_URL = 'https://dare.hss.cmu.edu';

export interface Chapter {
    id: string;
    title: string;
    subject: string;
    topic: string;
    book_id: string;
    user_id: string;
    book_title: string;
    greeting?: string;
    teaching_style?: string;
    qa_instructions?: string;
    restrictions?: string;
    created_at?: string;
    updated_at?: string;
}

interface CreateChapterData {
    title: string;
    subject: string;
    topic: string;
    bookId: string;
    userId: string;
}

interface UpdateChapterData {
    title?: string;
    subject?: string;
    topic?: string;
    greeting?: string;
    teaching_style?: string;
    qa_instructions?: string;
    restrictions?: string;
}

// Get all chapters for a user
export const getChapters = async (userId: string): Promise<Chapter[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/socratic-books/chapters`, {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        throw error;
    }
};

// Get all chapters for a specific book
export const getBookChapters = async (userId: string, bookId: string): Promise<Chapter[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/socratic-books/books/${bookId}/chapters`, {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching book chapters:', error);
        throw error;
    }
};

// Get a single chapter by ID
export const getChapter = async (userId: string, chapterId: string): Promise<Chapter> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/socratic-books/chapters/${chapterId}`, {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching chapter:', error);
        throw error;
    }
};

// Create a new chapter
export const createChapter = async (data: CreateChapterData): Promise<Chapter> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/socratic-books/chapters`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating chapter:', error);
        throw error;
    }
};

// Update chapter details
export const updateChapter = async (
    userId: string, 
    chapterId: string, 
    data: UpdateChapterData
): Promise<Chapter> => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}`,
            data,
            {
                params: { userId },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating chapter:', error);
        throw error;
    }
};

// Delete chapter (if API supports it)
export const deleteChapter = async (userId: string, chapterId: string): Promise<void> => {
    try {
        await axios.delete(`${API_BASE_URL}/api/socratic-books/chapters/${chapterId}`, {
            params: { userId }
        });
    } catch (error) {
        console.error('Error deleting chapter:', error);
        throw error;
    }
};
