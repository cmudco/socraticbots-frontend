import axios from 'axios';

const API_BASE_URL = 'https://dare.hss.cmu.edu';

export interface AccessCode {
    id: number;
    access_code: string;
    description: string;
    is_active: boolean;
    contact_andrew: string | null;
    affiliation: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAccessCodeData {
    access_code: string;
    description: string;
    is_active: boolean;
    contact_andrew?: string;
    affiliation?: string;
}

export const getUserAccessCodes = async (userId: string): Promise<AccessCode[]> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/socratic-books/users/${userId}/access-codes`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching access codes:', error);
        throw error;
    }
};

export const createAccessCode = async (
    userId: string, 
    data: CreateAccessCodeData
): Promise<AccessCode> => {
    try {
        // Set default values if not provided
        const payload = {
            ...data,
            affiliation: data.affiliation || 'student',
            contact_andrew: data.contact_andrew || undefined
        };

        const response = await axios.post(
            `${API_BASE_URL}/api/socratic-books/users/${userId}/access-codes`,
            payload
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
            // Handle validation errors
            throw new Error(error.response.data.message || 'Invalid input');
        }
        console.error('Error creating access code:', error);
        throw error;
    }
};

// Helper function to generate a random access code
export const generateRandomAccessCode = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
