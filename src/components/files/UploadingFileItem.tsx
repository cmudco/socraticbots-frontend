import React from 'react';

import { FileUploadStatus } from '../../types/file';

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: FileUploadStatus;
  error?: string;
}

interface UploadingFileItemProps {
  file: UploadingFile;
}

const UploadingFileItem: React.FC<UploadingFileItemProps> = ({ file }) => {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center">
            <svg className="h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
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
          </div>
          <div>
            <h5 className="font-medium text-gray-900">{file.name}</h5>
            <p className="text-sm text-gray-600">
              {file.status === FileUploadStatus.UPLOADING
                ? `Uploading... ${Math.round(file.progress)}%`
                : file.status === FileUploadStatus.PROCESSING
                  ? 'Upload complete, processing...'
                  : file.status === FileUploadStatus.ERROR
                    ? file.error
                    : 'Completed'}
            </p>
          </div>
        </div>
      </div>
      {file.status === FileUploadStatus.UPLOADING && (
        <div className="mt-2">
          <div className="h-2 w-full rounded-full bg-blue-200">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadingFileItem;
