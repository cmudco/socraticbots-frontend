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
    book_title?: string;
    greeting?: string;
    teaching_style?: string;
    qa_instructions?: string;
    restrictions?: string;
    created_at?: string;
    updated_at?: string;
}

interface PublicIdResponse {
    public_id: string;
}

interface CreateChapterData {
    title: string;
    subject?: string;
    topic?: string;
    bookId: string;
    userId: string;
}

interface UpdateChapterData {
    title: string;
    subject?: string;
    topic?: string;
    greeting?: string;
    teaching_style?: string;
    qa_instructions?: string;
    restrictions?: string;
}

interface PublishedStatus {
    is_published: boolean;
    is_public: boolean;
}

interface ProgressTrackerResponse {
    progress_tracker: string;
    created_at?: string;
    updated_at?: string;
}

export interface ChapterFilesAndTags {
    fileIds: string[];
    tags: string[];
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

export const getChapterFilesAndTags = async (chapterId: string): Promise<ChapterFilesAndTags> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/files-and-tags`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chapter files and tags:', error);
        throw error;
    }
};

export const updateChapterFilesAndTags = async (
    chapterId: string, 
    fileIds: string[], 
    tags: string[]
): Promise<ChapterFilesAndTags> => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/files-and-tags`, 
            { fileIds, tags },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating chapter files and tags:', error);
        throw error;
    }
};

// Get chapter's public_id
export const getChapterPublicId = async (chapterId: string): Promise<string> => {
    try {
        const response = await axios.get<PublicIdResponse>(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/public-id`
        );
        return response.data.public_id;
    } catch (error) {
        console.error('Error fetching chapter public ID:', error);
        throw error;
    }
};

// Generate new public_id for chapter
export const regenerateChapterPublicId = async (chapterId: string): Promise<string> => {
    try {
        const response = await axios.put<PublicIdResponse>(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/public-id`
        );
        return response.data.public_id;
    } catch (error) {
        console.error('Error regenerating chapter public ID:', error);
        throw error;
    }
};

export const getChapterPublishedStatus = async (chapterId: string): Promise<PublishedStatus> => {
    try {
        const response = await axios.get<PublishedStatus>(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/published`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching chapter published status:', error);
        throw error;
    }
};

export const updateChapterPublishedStatus = async (
    chapterId: string, 
    status: { is_published: boolean; is_public: boolean }
): Promise<PublishedStatus> => {
    try {
        const response = await axios.put<PublishedStatus>(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/published`,
            status
        );
        return response.data;
    } catch (error) {
        console.error('Error updating chapter published status:', error);
        throw error;
    }
};

export const getChapterProgressTracker = async (chapterId: string): Promise<ProgressTrackerResponse> => {
    try {
        const response = await axios.get<ProgressTrackerResponse>(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/progress-tracker`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching chapter progress tracker:', error);
        throw error;
    }
};

export const updateChapterProgressTracker = async (
    chapterId: string,
    progressTracker: string
): Promise<ProgressTrackerResponse> => {
    try {
        const response = await axios.put<ProgressTrackerResponse>(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/progress-tracker`,
            { progress_tracker: progressTracker },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating chapter progress tracker:', error);
        throw error;
    }
};