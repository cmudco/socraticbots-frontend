// src/services/files.service.ts
import { METHOD } from '../constants/requests';
import { ChapterFile, FileFilters, UploadFileRequest } from '../types/file';
import { baseRequest } from '../utils/baseRequest';

class FileService {
  private readonly baseUrl = 'files/';

  // Get files for a chapter
  async getChapterFiles(chapterPublicId: string, filters?: FileFilters): Promise<ChapterFile[]> {
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

    return baseRequest<ChapterFile[]>({
      url,
      method: METHOD.GET,
    });
  }

  // Get a single file by ID
  async getFile(chapterPublicId: string, fileId: string): Promise<ChapterFile> {
    return baseRequest<ChapterFile>({
      url: `${this.baseUrl}chapters/${chapterPublicId}/${fileId}/`,
      method: METHOD.GET,
    });
  }

  // Upload a file to a chapter
  async uploadChapterFile(
    chapterPublicId: string,
    uploadData: UploadFileRequest
  ): Promise<ChapterFile> {
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('name', uploadData.name || uploadData.file.name);

    return baseRequest<ChapterFile>({
      url: `${this.baseUrl}chapters/${chapterPublicId}/`,
      method: METHOD.POST,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Update file metadata
  async updateFile(
    chapterPublicId: string,
    fileId: string,
    updateData: Partial<Pick<ChapterFile, 'name'>>
  ): Promise<ChapterFile> {
    return baseRequest<ChapterFile>({
      url: `${this.baseUrl}chapters/${chapterPublicId}/${fileId}/`,
      method: METHOD.PATCH,
      data: updateData,
    });
  }

  // Delete a file
  async deleteFile(chapterPublicId: string, fileId: string): Promise<void> {
    return baseRequest<void>({
      url: `${this.baseUrl}chapters/${chapterPublicId}/${fileId}/`,
      method: METHOD.DELETE,
    });
  }

  // Reprocess a file (if backend supports it)
  async reprocessFile(chapterPublicId: string, fileId: string): Promise<ChapterFile> {
    return baseRequest<ChapterFile>({
      url: `${this.baseUrl}chapters/${chapterPublicId}/${fileId}/reprocess/`,
      method: METHOD.POST,
    });
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
    return baseRequest<ChapterFile[]>({
      url: `${this.baseUrl}search/?q=${encodeURIComponent(query)}`,
      method: METHOD.GET,
    });
  }

  // Get files by processing status
  async getFilesByStatus(
    chapterPublicId: string,
    status: ChapterFile['processing_status']
  ): Promise<ChapterFile[]> {
    return baseRequest<ChapterFile[]>({
      url: `${this.baseUrl}chapters/${chapterPublicId}/?processing_status=${status}`,
      method: METHOD.GET,
    });
  }
}

// Export a singleton instance
export const fileService = new FileService();
