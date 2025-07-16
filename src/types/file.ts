export enum FileProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum FileUploadStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export interface ChapterFile {
  id: string;
  chapter: string;
  file: string;
  name: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
  text_snippet?: string;
  word_count?: number;
  processing_status: FileProcessingStatus;
  extracted_text_file?: string;
  error_message?: string;
  vector_ids?: string[];
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: FileUploadStatus;
  error?: string;
}

export interface UploadFileRequest {
  file: File;
  name?: string;
}

export interface FileFilters {
  processing_status?: FileProcessingStatus;
  file_type?: string;
  search?: string;
}
