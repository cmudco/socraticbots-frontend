import { METHOD } from '@/constants/requests';
import { baseRequest } from '@/utils/baseRequest';

export interface BotFile {
  id: number;
  user: number;
  name: string;
  file: string;
  fileType: string;
  size: number;
  tags: string[];
  jobId: string;
  status: number; // 0: processing, 1: processed, 2: failed (DARE values)
  vectorDbSource: number;
  errorMessage: string | null;
  wordCount?: number;
  uploadedAt: string;
}

export interface BotFileUploadRequest {
  files: FileList;
  names?: string[];
  tags?: string[];
}

export interface BotFileListResponse {
  files: BotFile[];
  count: number;
}

class BotFileService {
  /**
   * Get all files associated with a bot
   */
  async getBotFiles(_botGroupId: number, botId: number): Promise<BotFileListResponse> {
    return baseRequest<BotFileListResponse>({
      url: `files/bots/${botId}/`,
      method: METHOD.GET,
    });
  }

  /**
   * Upload files to a bot via DARE backend
   */
  async uploadBotFiles(
    _botGroupId: number,
    botId: number,
    uploadData: BotFileUploadRequest
  ): Promise<BotFileListResponse> {
    const formData = new FormData();
    
    // Add files and names to FormData (following DARE pattern)
    Array.from(uploadData.files).forEach((file) => {
      formData.append('files', file);
      formData.append('names', file.name); // Always send the file name
    });
    
    // Add additional custom names if provided (optional override)
    if (uploadData.names) {
      uploadData.names.forEach(name => {
        formData.append('names', name);
      });
    }
    
    // Add optional tags
    if (uploadData.tags) {
      uploadData.tags.forEach(tag => {
        formData.append('tags', tag);
      });
    }

    return baseRequest<BotFileListResponse>({
      url: `files/bots/${botId}/`,
      method: METHOD.POST,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Remove a file from a bot
   */
  async removeBotFile(
    _botGroupId: number,
    botId: number,
    fileId: number,
    deleteFromDare = false
  ): Promise<void> {
    const params = deleteFromDare ? '?delete_from_dare=true' : '';
    
    return baseRequest<void>({
      url: `files/bots/${botId}/${fileId}/${params}`,
      method: METHOD.DELETE,
    });
  }

  /**
   * Get file download URL
   */
  getFileDownloadUrl(_botGroupId: number, botId: number, fileId: number): string {
    return `/api/files/bots/${botId}/${fileId}/download/`;
  }

  /**
   * Get secure file serving URL
   */
  getSecureFileUrl(fileId: number): string {
    return `/api/files/serve/${fileId}/`;
  }
}

export const botFileService = new BotFileService();