import React from 'react';

import { ChapterFile, FileProcessingStatus, FileUploadStatus } from '@/types/file';

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: FileUploadStatus;
  error?: string;
}

interface FileStatusSummaryProps {
  files: ChapterFile[];
  uploadingFiles: UploadingFile[];
}

const FileStatusSummary: React.FC<FileStatusSummaryProps> = ({ files, uploadingFiles }) => {
  const statusCounts = {
    processing: files.filter(
      f =>
        f.processing_status === FileProcessingStatus.PROCESSING ||
        f.processing_status === FileProcessingStatus.PENDING
    ).length,
    completed: files.filter(f => f.processing_status === FileProcessingStatus.COMPLETED).length,
    failed: files.filter(f => f.processing_status === FileProcessingStatus.FAILED).length,
    uploading: uploadingFiles.filter(f => f.status === FileUploadStatus.UPLOADING).length,
  };

  if (files.length === 0 && uploadingFiles.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {statusCounts.uploading > 0 && (
        <div className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
          <svg className="mr-1 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {statusCounts.uploading} uploading
        </div>
      )}
      {statusCounts.processing > 0 && (
        <div className="flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
          <svg className="mr-1 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {statusCounts.processing} processing
        </div>
      )}
      {statusCounts.completed > 0 && (
        <div className="flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
          <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {statusCounts.completed} completed
        </div>
      )}
      {statusCounts.failed > 0 && (
        <div className="flex items-center rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">
          <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {statusCounts.failed} failed
        </div>
      )}
    </div>
  );
};

export default FileStatusSummary;
