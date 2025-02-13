import axios from 'axios';

const API_BASE_URL = 'https://dare.hss.cmu.edu';

export interface Chapter {
    id: string;
    bookId: string;
    title: string;
    description?: string;
    order: number;
    created_at?: string;
    updated_at?: string;
}

export const getChapters = async (bookId: string): Promise<Chapter[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/socratic-books/chapters?bookId=${bookId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        throw error;
    }
};

// Add more chapter-related API calls here (create, update, delete)
