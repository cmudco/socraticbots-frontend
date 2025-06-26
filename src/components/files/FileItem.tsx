import React from 'react';
import { ChapterFile, FileProcessingStatus } from '../../types/file';

interface FileItemProps {
    file: ChapterFile;
    onDelete: (fileId: string, fileName: string) => void;
    isDeleting?: boolean;
}

const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return (
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
            );
        case 'doc':
        case 'docx':
            return (
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
            );
        default:
            return (
                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
            );
    }
};

const getStatusDisplay = (status: FileProcessingStatus) => {
    switch (status) {
        case FileProcessingStatus.COMPLETED:
            return (
                <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">completed</span>
                </div>
            );
        case FileProcessingStatus.PROCESSING:
        case FileProcessingStatus.PENDING:
            return (
                <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">{status}</span>
                </div>
            );
        case FileProcessingStatus.FAILED:
            return (
                <div className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">failed</span>
                </div>
            );
        default:
            return (
                <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                    <span className="text-sm font-medium">{status}</span>
                </div>
            );
    }
};

const FileItem: React.FC<FileItemProps> = ({ file, onDelete, isDeleting }) => {
    return (
        <div className={`p-3 border rounded-lg transition-all ${file.processing_status === FileProcessingStatus.PROCESSING || file.processing_status === FileProcessingStatus.PENDING
            ? 'bg-yellow-50 border-yellow-200'
            : file.processing_status === FileProcessingStatus.COMPLETED
                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                : file.processing_status === FileProcessingStatus.FAILED
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {getFileIcon(file.file_type)}
                    <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-gray-900 truncate">{file.name}</h5>
                        <p className="text-sm text-gray-500">
                            {file.word_count ? `${file.word_count.toLocaleString()} words • ` : ''}
                            {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                        {file.error_message && (
                            <p className="text-sm text-red-600">{file.error_message}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {getStatusDisplay(file.processing_status)}
                    <button
                        onClick={() => onDelete(file.id, file.name)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete file"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileItem;