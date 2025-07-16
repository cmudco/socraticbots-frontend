import { METHOD } from '@/constants/requests';

import { baseRequest } from '@/utils/baseRequest';

import { ChapterFile, FileFilters, UploadFileRequest } from '@/types/file';

class FileService {
  private readonly baseUrl = 'files/';

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

  async getFile(chapterPublicId: string, fileId: string): Promise<ChapterFile> {
    return baseRequest<ChapterFile>({
      url: `${this.baseUrl}chapters/${chapterPublicId}/${fileId}/`,
      method: METHOD.GET,
    });
  }

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

  async deleteFile(chapterPublicId: string, fileId: string): Promise<void> {
    return baseRequest<void>({
      url: `${this.baseUrl}chapters/${chapterPublicId}/${fileId}/`,
      method: METHOD.DELETE,
    });
  }

  async reprocessFile(chapterPublicId: string, fileId: string): Promise<ChapterFile> {
    return baseRequest<ChapterFile>({
      url: `${this.baseUrl}chapters/${chapterPublicId}/${fileId}/reprocess/`,
      method: METHOD.POST,
    });
  }

  getSecureFileUrl(fileId: string): string {
    return `/api/files/serve/${fileId}/`;
  }

  getDownloadUrl(chapterPublicId: string, fileId: string): string {
    return `${this.baseUrl}chapters/${chapterPublicId}/${fileId}/download/`;
  }

  async searchFiles(query: string): Promise<ChapterFile[]> {
    return baseRequest<ChapterFile[]>({
      url: `${this.baseUrl}search/?q=${encodeURIComponent(query)}`,
      method: METHOD.GET,
    });
  }

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

export const fileService = new FileService();
