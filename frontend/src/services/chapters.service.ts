// src/services/chapter.service.ts
import { api } from './api/instance';

export interface Chapter {
  id: string;
  title: string;
  subject: string;
  topic: string;
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
  async createChapter(bookId: string, chapterData: CreateChapterRequest): Promise<Chapter> {
    try {
      const response = await api.post<Chapter>(`/books/${bookId}/chapters/`, chapterData);
      return response.data;
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }
  }
  
  // Update a chapter
  async updateChapter(
    bookId: string, 
    chapterId: string, 
    chapterData: UpdateChapterRequest
  ): Promise<Chapter> {
    try {
      const response = await api.patch<Chapter>(
        `/books/${bookId}/chapters/${chapterId}/`, 
        chapterData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating chapter ${chapterId}:`, error);
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
