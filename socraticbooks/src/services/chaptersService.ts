// src/services/chaptersService.ts
import axios from 'axios';

const API_BASE_URL = 'https://dare.hss.cmu.edu';

export interface Chapter {
    id: string;
    title: string;
    subject?: string;
    topic?: string;
    book_id: string;  // Changed from bookId to book_id
    user_id: string;  // Added user_id
    book_title: string; // Added book_title
    created_at?: string;
    updated_at?: string;
}

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
