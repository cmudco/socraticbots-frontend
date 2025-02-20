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

export interface LLMModel {
    id: number;
    name: string;
    provider: string;
    model_id: string;
    is_active: boolean;
    description: string;
}

export interface ChapterModelSettings {
    basic_prompt_model_id: number;
    tracking_prompt_model_id: number;
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

export const getLLMModels = async (): Promise<LLMModel[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/socratic-books/llm-models`);
        return response.data.models;
    } catch (error) {
        console.error('Error fetching LLM models:', error);
        throw error;
    }
};

export const getChapterModelSettings = async (chapterId: string): Promise<ChapterModelSettings> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/model-settings`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chapter model settings:', error);
        throw error;
    }
};

export const updateChapterModelSettings = async (
    chapterId: string, 
    settings: ChapterModelSettings
): Promise<ChapterModelSettings> => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/api/socratic-books/chapters/${chapterId}/model-settings`,
            settings
        );
        return response.data;
    } catch (error) {
        console.error('Error updating chapter model settings:', error);
        throw error;
    }
};