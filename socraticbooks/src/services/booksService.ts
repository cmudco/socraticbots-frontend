// src/services/booksService.ts
import axios from 'axios';

const API_BASE_URL = 'https://dare.hss.cmu.edu';

export interface Book {
    id: string;
    title: string;
    description: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export const getBooks = async (userId: string): Promise<Book[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/socratic-books/books?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
};
