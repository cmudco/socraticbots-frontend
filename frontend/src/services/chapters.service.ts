// src/services/chapters.service.ts
import { api } from './api/instance';
import { AIModel } from './models.service';
import axios, { AxiosError } from 'axios';

export interface ModelPreference {
  id: string;
  chat_model?: AIModel;
  tracking_model?: AIModel;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  title: string;
  subject: string;
  topic: string;
  model_preference?: ModelPreference;
  created_at: string;
  updated_at: string;
}

export interface CreateChapterRequest {
  title: string;
  subject: string;
  topic: string;
}

export interface UpdateChapterRequest {
  title?: string;
  subject?: string;
  topic?: string;
}

export interface ChapterModelPreferenceRequest {
  chat_model_id?: string;
  tracking_model_id?: string;
}

class ChapterService {
  // Get all chapters for a specific book
  async getChapters(bookId: string): Promise<Chapter[]> {
    try {
      const response = await api.get<Chapter[]>(`/books/${bookId}/chapters/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  }
  
  // Get a single chapter by ID for a specific book
  async getChapter(bookId: string, chapterId: string): Promise<Chapter> {
    try {
      const response = await api.get<Chapter>(`/books/${bookId}/chapters/${chapterId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chapter ${chapterId}:`, error);
      throw error;
    }
  }
  
  // Create a new chapter for a book
  async createChapter(
    bookId: string, 
    chapterData: CreateChapterRequest, 
    modelPreferences?: ChapterModelPreferenceRequest
  ): Promise<Chapter> {
    try {
      // First create the chapter
      const response = await api.post<Chapter>(`/books/${bookId}/chapters/`, chapterData);
      const newChapter = response.data;
      
      // If model preferences are provided, set them
      if (modelPreferences && (modelPreferences.chat_model_id || modelPreferences.tracking_model_id)) {
        await this.setChapterModelPreferences(bookId, newChapter.id, modelPreferences);
        
        // Fetch the updated chapter with preferences
        return await this.getChapter(bookId, newChapter.id);
      }
      
      return newChapter;
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }
  }
  
  // Update a chapter
  async updateChapter(
    bookId: string, 
    chapterId: string, 
    chapterData: UpdateChapterRequest,
    modelPreferences?: ChapterModelPreferenceRequest
  ): Promise<Chapter> {
    try {
      // Update the chapter basic info
      const response = await api.patch<Chapter>(
        `/books/${bookId}/chapters/${chapterId}/`, 
        chapterData
      );
      
      // If model preferences are provided, update them
      if (modelPreferences && (modelPreferences.chat_model_id || modelPreferences.tracking_model_id)) {
        await this.setChapterModelPreferences(bookId, chapterId, modelPreferences);
        
        // Fetch the updated chapter with preferences
        return await this.getChapter(bookId, chapterId);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating chapter ${chapterId}:`, error);
      throw error;
    }
  }
  
  // Set model preferences for a chapter
  async setChapterModelPreferences(
    bookId: string,
    chapterId: string,
    preferences: ChapterModelPreferenceRequest
  ): Promise<ModelPreference> {
    try {
      const response = await api.post<ModelPreference>(
        `/books/${bookId}/chapters/${chapterId}/model-preferences/`,
        preferences
      );
      return response.data;
    } catch (error) {
      // Fix the error handling with proper type checking
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response && axiosError.response.status === 404) {
          // If 404, try PUT instead (for updating existing preferences)
          try {
            const response = await api.put<ModelPreference>(
              `/books/${bookId}/chapters/${chapterId}/model-preferences/`,
              preferences
            );
            return response.data;
          } catch (putError) {
            console.error(`Error updating model preferences for chapter ${chapterId}:`, putError);
            throw putError;
          }
        }
      }
      console.error(`Error setting model preferences for chapter ${chapterId}:`, error);
      throw error;
    }
  }
  
  // Get model preferences for a chapter
  async getChapterModelPreferences(
    bookId: string,
    chapterId: string
  ): Promise<ModelPreference> {
    try {
      const response = await api.get<ModelPreference>(
        `/books/${bookId}/chapters/${chapterId}/model-preferences/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error getting model preferences for chapter ${chapterId}:`, error);
      throw error;
    }
  }
  
  // Delete a chapter
  async deleteChapter(bookId: string, chapterId: string): Promise<void> {
    try {
      await api.delete(`/books/${bookId}/chapters/${chapterId}/`);
    } catch (error) {
      console.error(`Error deleting chapter ${chapterId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const chapterService = new ChapterService();
