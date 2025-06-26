// src/services/files.service.ts
import { api } from './api/instance';
import { ChapterFile, UploadFileRequest, FileFilters } from '../types/file';

class FileService {
  private readonly baseUrl = '/files/';

  // Get files for a chapter
  async getChapterFiles(chapterPublicId: string, filters?: FileFilters): Promise<ChapterFile[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.processing_status) {
        params.append('processing_status', filters.processing_status);
      }
      if (filters?.file_type) {
        params.append('file_type', filters.file_type);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}chapters/${chapterPublicId}/${queryString ? `?${queryString}` : ''}`;

      const response = await api.get<ChapterFile[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapter files:', error);
      throw error;
    }
  }

  // Get a single file by ID
  async getFile(chapterPublicId: string, fileId: string): Promise<ChapterFile> {
    try {
      const response = await api.get<ChapterFile>(`${this.baseUrl}chapters/${chapterPublicId}/${fileId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching file ${fileId}:`, error);
      throw error;
    }
  }

  // Upload a file to a chapter
  async uploadChapterFile(
    chapterPublicId: string,
    uploadData: UploadFileRequest,
    onProgress?: (progress: number) => void
  ): Promise<ChapterFile> {
    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('name', uploadData.name || uploadData.file.name);

      const response = await api.post<ChapterFile>(
        `${this.baseUrl}chapters/${chapterPublicId}/`,
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

  // Update file metadata
  async updateFile(chapterPublicId: string, fileId: string, updateData: Partial<Pick<ChapterFile, 'name'>>): Promise<ChapterFile> {
    try {
      const response = await api.patch<ChapterFile>(`${this.baseUrl}chapters/${chapterPublicId}/${fileId}/`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating file ${fileId}:`, error);
      throw error;
    }
  }

  // Delete a file
  async deleteFile(chapterPublicId: string, fileId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}chapters/${chapterPublicId}/${fileId}/`);
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error);
      throw error;
    }
  }

  // Reprocess a file (if backend supports it)
  async reprocessFile(chapterPublicId: string, fileId: string): Promise<ChapterFile> {
    try {
      const response = await api.post<ChapterFile>(`${this.baseUrl}chapters/${chapterPublicId}/${fileId}/reprocess/`);
      return response.data;
    } catch (error) {
      console.error(`Error reprocessing file ${fileId}:`, error);
      throw error;
    }
  }

  // Get secure file URL for download/viewing
  getSecureFileUrl(fileId: string): string {
    return `/api/files/serve/${fileId}/`;
  }

  // Get file download URL
  getDownloadUrl(chapterPublicId: string, fileId: string): string {
    return `${this.baseUrl}chapters/${chapterPublicId}/${fileId}/download/`;
  }

  // Search files across all chapters (if backend supports it)
  async searchFiles(query: string): Promise<ChapterFile[]> {
    try {
      const response = await api.get<ChapterFile[]>(`${this.baseUrl}search/?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching files with query "${query}":`, error);
      throw error;
    }
  }

  // Get files by processing status
  async getFilesByStatus(chapterPublicId: string, status: ChapterFile['processing_status']): Promise<ChapterFile[]> {
    try {
      const response = await api.get<ChapterFile[]>(`${this.baseUrl}chapters/${chapterPublicId}/?processing_status=${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching files with status "${status}":`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const fileService = new FileService();
