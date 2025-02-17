// src/services/chatService.ts
import axios from 'axios';
const API_BASE_URL  = 'https://dare.hss.cmu.edu';

export interface Chapter {
    id: string;
    title: string;
    subject?: string;
    topic?: string;
    book_id: string;
    book_title: string;
    greeting?: string;
    teaching_style?: string;
    qa_instructions?: string;
    public_id: string;
    is_published: boolean;
    is_public: boolean;
    is_owner: boolean;
    created_at: string;
    updated_at: string;
}

export const getAvailableChapters = async (userId: string): Promise<Chapter[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/socratic-books/users/${userId}/available-chapters`);
        return response.data;
    } catch (error) {
        console.error('Error fetching available chapters:', error);
        throw error;
    }
};
