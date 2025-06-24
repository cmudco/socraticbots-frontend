// src/services/files.service.ts
import { api } from './api/instance';

export interface ChapterFile {
    id: string;
    chapter: string;          // Add chapter reference
    file: string;
    name: string;
    file_type: string;
    uploaded_at: string;
    uploaded_by: string;
    text_snippet?: string;
    word_count?: number;
    processing_status: 'pending' | 'processing' | 'completed' | 'failed';
    extracted_text_file?: string;
    error_message?: string;   // Add error message field
    vector_ids?: string[];    // Add vector IDs field
  }

class FileService {
  // Get files for a chapter
  async getChapterFiles(chapterPublicId: string): Promise<ChapterFile[]> {
    try {
      const response = await api.get<ChapterFile[]>(`/files/chapters/${chapterPublicId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapter files:', error);
      throw error;
    }
  }

  // Upload a file to a chapter
  async uploadChapterFile(chapterPublicId: string, file: File, onProgress?: (progress: number) => void): Promise<ChapterFile> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      
      const response = await api.post<ChapterFile>(
        `/files/chapters/${chapterPublicId}/`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = (progressEvent.loaded * 100) / progressEvent.total;
              onProgress(progress);
            }
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Delete a file
  async deleteFile(fileId: string, chapterPublicId: string): Promise<void> {
    try {
      await api.delete(`/files/chapters/${chapterPublicId}/${fileId}/`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Get secure file URL for download/viewing
  getSecureFileUrl(fileId: string): string {
    return `/api/files/serve/${fileId}/`;
  }
}

// Export a singleton instance
export const fileService = new FileService();
