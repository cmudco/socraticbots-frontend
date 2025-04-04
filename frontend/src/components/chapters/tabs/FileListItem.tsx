// src/components/chapters/tabs/FileListItem.tsx
import React from 'react';
import { ChapterFile } from '../../../services/files.service';

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
  onDelete
}) => {
  // Function to get file icon based on type
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        );
    }
  };

// Get status color
const getStatusColor = () => {
  if (error) {
    // Check if it's the large file processing message
    if (error.includes('Large file is still processing')) {
      return 'text-yellow-500';  // Keep it yellow like processing
    }
    return 'text-red-500';
  }
  if (isProcessing) return 'text-yellow-500';
  if (file.processing_status === 'completed') return 'text-green-500';
  return 'text-gray-500';
};

// Get status text
const getStatusText = () => {
  if (error) {
    // Check if it's the large file processing message
    if (error.includes('Large file is still processing')) {
      return 'Processing';  // Still show as "Processing"
    }
    return 'Error';
  }
  if (progress !== undefined) return 'Uploading';
  if (isProcessing || file.processing_status === 'processing' || file.processing_status === 'pending') return 'Processing';
  return file.processing_status === 'completed' ? 'Ready' : 'Failed';
};

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        {/* File Info */}
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

        {/* Status and Actions */}
        <div className="flex items-center space-x-4">
          {/* Status */}
          <span className={`text-sm ${getStatusColor()}`}>
            {getStatusText()}
          </span>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            {/* Delete button */}
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
              disabled={progress !== undefined}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`mt-2 text-sm ${
          error.includes('Large file is still processing') 
            ? 'text-yellow-500' 
            : 'text-red-500'
        }`}>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileListItem;
