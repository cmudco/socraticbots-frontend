// src/services/chapterAccessCodes.ts
import axios from 'axios';

const API_BASE_URL = 'https://dare.hss.cmu.edu';

export interface ChapterAccessCode {
    id: number;
    access_code: string;
    description: string;
    is_active: boolean;
}

// Get access codes for a chapter 
export const getChapterAccessCodes = async (chapterId: string): Promise<ChapterAccessCode[]> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/access-codes`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching chapter access codes:', error);
        throw error;
    }
};

// Add access code to chapter
export const addAccessCodeToChapter = async (
    chapterId: string,
    accessCodeId: number,
    userId: string
): Promise<void> => {
    try {
        await axios.post(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/access-codes/${accessCodeId}`,
            { user_id: userId },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error adding access code to chapter:', error);
        throw error;
    }
};

// Remove access code from chapter
export const removeAccessCodeFromChapter = async (
    chapterId: string,
    accessCodeId: number,
    userId: string
): Promise<void> => {
    try {
        await axios.delete(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/access-codes/${accessCodeId}`,
            {
                data: { user_id: userId },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error removing access code from chapter:', error);
        throw error;
    }
};
