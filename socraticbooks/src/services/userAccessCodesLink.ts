// src/services/userAccessCodes.ts
import axios from 'axios';

const API_BASE_URL = 'https://dare.hss.cmu.edu';

export interface UserAccessCode {
    id: number;
    access_code: string;
    description: string;
    is_active: boolean;
    is_registration_code: boolean;
    added_at: string;
}

// Get all access codes for a user (registration + additional)
export const getAllUserAccessCodes = async (userId: string): Promise<UserAccessCode[]> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/socratic-books/users/${userId}/all-access-codes`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching user access codes:', error);
        throw error;
    }
};

// Add an additional access code to a user
export const addAdditionalAccessCode = async (
    userId: string,
    accessCode: string
): Promise<void> => {
    try {
        await axios.post(
            `${API_BASE_URL}/api/socratic-books/users/${userId}/additional-access-codes/${accessCode}`
        );
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.error || 'Failed to add access code';
            throw new Error(message);
        }
        throw error;
    }
};

// Remove an additional access code from a user
export const removeAdditionalAccessCode = async (
    userId: string,
    accessCode: string
): Promise<void> => {
    try {
        await axios.delete(
            `${API_BASE_URL}/api/socratic-books/users/${userId}/additional-access-codes/${accessCode}`
        );
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.error || 'Failed to remove access code';
            throw new Error(message);
        }
        throw error;
    }
};
