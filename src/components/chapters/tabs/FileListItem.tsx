import React from 'react';

import { ChapterFile } from '@/types/file';

interface FileListItemProps {
  file: ChapterFile;
  progress?: number;
  isProcessing: boolean;
  error?: string;
  onDelete: () => void;
}

const FileListItem: React.FC<FileListItemProps> = ({
  file,
  progress,
  isProcessing,
  error,
  onDelete,
}) => {
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        );
    }
  };

  const getStatusColor = () => {
    if (error) {
      if (error.includes('Large file is still processing')) {
        return 'text-yellow-500';
      }
      return 'text-red-500';
    }
    if (isProcessing) return 'text-yellow-500';
    if (file.processing_status === 'completed') return 'text-green-500';
    return 'text-gray-500';
  };

  const getStatusText = () => {
    if (error) {
      if (error.includes('Large file is still processing')) {
        return 'Processing';
      }
      return 'Error';
    }
    if (progress !== undefined) return 'Uploading';
    if (
      isProcessing ||
      file.processing_status === 'processing' ||
      file.processing_status === 'pending'
    )
      return 'Processing';
    return file.processing_status === 'completed' ? 'Ready' : 'Failed';
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getFileIcon(file.file_type)}
          <div>
            <h4 className="font-medium text-gray-900">{file.name}</h4>
            <p className="text-sm text-gray-500">
              {file.word_count ? `${file.word_count} words • ` : ''}
              Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>

          {progress !== undefined && (
            <div className="h-2 w-24 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
              disabled={progress !== undefined}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          className={`mt-2 text-sm ${
            error.includes('Large file is still processing') ? 'text-yellow-500' : 'text-red-500'
          }`}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default FileListItem;
